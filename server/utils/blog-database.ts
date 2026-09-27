import {
  createError,
  deleteCookie,
  getCookie,
  getHeader,
  getRequestURL,
  setCookie,
} from "h3";
import type { H3Event } from "h3";

export const BLOG_ADMIN_SESSION_COOKIE = "kouvera_blog_admin";
const blogAdminSessionSeconds = 60 * 60 * 24;

type D1Result = {
  meta?: {
    changes?: number;
  };
};

type D1Statement = {
  bind(...values: unknown[]): D1Statement;
  all<T>(): Promise<{ results: T[] }>;
  run(): Promise<D1Result>;
};

type D1Database = {
  prepare(query: string): D1Statement;
};

type BlogEnvironment = {
  BLOG_DB?: D1Database;
  BLOG_ADMIN_TOKEN?: string;
};

type CloudflareContext = {
  env?: BlogEnvironment;
};

type CloudflareH3Event = H3Event & {
  context: H3Event["context"] & {
    cloudflare?: CloudflareContext;
  };
  req: H3Event["req"] & {
    runtime?: {
      cloudflare?: CloudflareContext;
    };
  };
};

export function getBlogEnvironment(event: H3Event): BlogEnvironment {
  const cloudflareEvent = event as CloudflareH3Event;
  const environment =
    cloudflareEvent.context.cloudflare?.env ??
    cloudflareEvent.req.runtime?.cloudflare?.env;

  if (!environment?.BLOG_DB) {
    throw createError({
      statusCode: 503,
      statusMessage:
        "Blog database is not configured. Add the BLOG_DB binding.",
    });
  }

  return environment;
}

export function getBlogDatabase(event: H3Event): D1Database {
  return getBlogEnvironment(event).BLOG_DB!;
}

function getBlogAdminToken(environment: BlogEnvironment): string {
  if (!environment.BLOG_ADMIN_TOKEN) {
    throw createError({
      statusCode: 503,
      statusMessage: "Blog publishing is not configured on this Worker.",
    });
  }

  return environment.BLOG_ADMIN_TOKEN;
}

function tokenMatches(suppliedToken: string, expectedToken: string): boolean {
  if (suppliedToken.length !== expectedToken.length) return false;

  let difference = 0;
  for (let index = 0; index < suppliedToken.length; index += 1) {
    difference |=
      suppliedToken.charCodeAt(index) ^ expectedToken.charCodeAt(index);
  }

  return difference === 0;
}

function getSessionCookieOptions(event: H3Event) {
  return {
    httpOnly: true,
    maxAge: blogAdminSessionSeconds,
    path: "/api/blog",
    sameSite: "strict" as const,
    secure: getRequestURL(event).protocol === "https:",
  };
}

function encodeBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function decodeBase64Url(value: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;

  try {
    const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    return null;
  }
}

async function getSessionSigningKey(token: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(token),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function isValidBlogAdminSession(
  event: H3Event,
  token: string,
): Promise<boolean> {
  const session = getCookie(event, BLOG_ADMIN_SESSION_COOKIE);
  if (!session) return false;

  const [expiryText, signatureText, ...extraParts] = session.split(".");
  if (!expiryText || !signatureText || extraParts.length > 0) return false;
  if (!/^[0-9a-z]+$/.test(expiryText)) return false;

  const expiry = Number.parseInt(expiryText, 36);
  const now = Math.floor(Date.now() / 1000);
  if (
    !Number.isSafeInteger(expiry) ||
    expiry <= now ||
    expiry > now + blogAdminSessionSeconds
  ) {
    return false;
  }

  const signature = decodeBase64Url(signatureText);
  if (!signature) return false;

  const key = await getSessionSigningKey(token);
  return crypto.subtle.verify(
    "HMAC",
    key,
    new Uint8Array(signature),
    new TextEncoder().encode(expiryText),
  );
}

export async function startBlogAdminSession(
  event: H3Event,
  suppliedToken: string,
): Promise<void> {
  const environment = getBlogEnvironment(event);
  const token = getBlogAdminToken(environment);

  if (!tokenMatches(suppliedToken, token)) {
    throw createError({
      statusCode: 401,
      statusMessage: "The owner key is incorrect.",
    });
  }

  const expiryText = (
    Math.floor(Date.now() / 1000) + blogAdminSessionSeconds
  ).toString(36);
  const key = await getSessionSigningKey(token);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(expiryText),
  );

  setCookie(
    event,
    BLOG_ADMIN_SESSION_COOKIE,
    `${expiryText}.${encodeBase64Url(new Uint8Array(signature))}`,
    getSessionCookieOptions(event),
  );
}

export async function hasBlogAdminSession(event: H3Event): Promise<boolean> {
  const environment = getBlogEnvironment(event);
  const token = getBlogAdminToken(environment);
  return isValidBlogAdminSession(event, token);
}

export function endBlogAdminSession(event: H3Event): void {
  deleteCookie(
    event,
    BLOG_ADMIN_SESSION_COOKIE,
    getSessionCookieOptions(event),
  );
}

export async function requireBlogAdmin(event: H3Event): Promise<D1Database> {
  const environment = getBlogEnvironment(event);
  const token = getBlogAdminToken(environment);
  const authorization = getHeader(event, "authorization") ?? "";
  const suppliedToken = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";

  if (
    authorization.startsWith("Bearer ") &&
    tokenMatches(suppliedToken, token)
  ) {
    return environment.BLOG_DB!;
  }

  if (await isValidBlogAdminSession(event, token)) {
    const origin = getHeader(event, "origin");
    if (!origin || origin !== getRequestURL(event).origin) {
      throw createError({
        statusCode: 403,
        statusMessage: "The request origin is not allowed.",
      });
    }

    return environment.BLOG_DB!;
  }

  throw createError({
    statusCode: 401,
    statusMessage: "The owner key is incorrect.",
  });
}
