import { createError, defineEventHandler, readBody } from "h3";
import { requireBlogAdmin } from "../../utils/blog-database";

type UpdateBlogStatusBody = {
  message?: unknown;
};

export default defineEventHandler(async (event) => {
  const database = await requireBlogAdmin(event);
  const body = await readBody<UpdateBlogStatusBody>(event);

  if (typeof body?.message !== "string") {
    throw createError({
      statusCode: 400,
      statusMessage: "A status message is required.",
    });
  }

  const message = body.message.trim();
  if (!message || message.length > 180) {
    throw createError({
      statusCode: 400,
      statusMessage: "Use a status message between 1 and 180 characters.",
    });
  }

  const updatedAt = new Date().toISOString();
  await database
    .prepare(
      "INSERT INTO blog_status (id, message, updated_at) VALUES ('current', ?, ?) ON CONFLICT(id) DO UPDATE SET message = excluded.message, updated_at = excluded.updated_at",
    )
    .bind(message, updatedAt)
    .run();

  return { message, updatedAt };
});