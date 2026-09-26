import { createError, getHeader } from "h3";
import type { H3Event } from "h3";

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

export function requireBlogAdmin(event: H3Event): D1Database {
  const environment = getBlogEnvironment(event);

  if (!environment.BLOG_ADMIN_TOKEN) {
    throw createError({
      statusCode: 503,
      statusMessage: "Blog publishing is not configured on this Worker.",
    });
  }

  const authorization = getHeader(event, "authorization") ?? "";
  const suppliedToken = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";

  if (suppliedToken.length !== environment.BLOG_ADMIN_TOKEN.length) {
    throw createError({
      statusCode: 401,
      statusMessage: "The owner key is incorrect.",
    });
  }

  let difference = 0;
  for (let index = 0; index < suppliedToken.length; index += 1) {
    difference |=
      suppliedToken.charCodeAt(index) ^
      environment.BLOG_ADMIN_TOKEN.charCodeAt(index);
  }

  if (difference !== 0) {
    throw createError({
      statusCode: 401,
      statusMessage: "The owner key is incorrect.",
    });
  }

  return environment.BLOG_DB!;
}
