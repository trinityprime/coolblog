import { createError, defineEventHandler, getHeader } from "h3";
import { startBlogAdminSession } from "../../utils/blog-database";

export default defineEventHandler(async (event) => {
  const authorization = getHeader(event, "authorization") ?? "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "An owner key is required.",
    });
  }

  await startBlogAdminSession(event, token);
  return { authenticated: true };
});
