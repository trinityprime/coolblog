import {
  createError,
  defineEventHandler,
  readBody,
  setResponseStatus,
} from "h3";
import { requireBlogAdmin } from "../../utils/blog-database";

type CreateBlogPostBody = {
  title?: unknown;
  content?: unknown;
};

export default defineEventHandler(async (event) => {
  const database = await requireBlogAdmin(event);
  const body = await readBody<CreateBlogPostBody>(event);

  if (typeof body?.title !== "string" || typeof body.content !== "string") {
    throw createError({
      statusCode: 400,
      statusMessage: "A title and post body are required.",
    });
  }

  const title = body.title.trim();
  const content = body.content.trim();

  if (!title || !content || title.length > 100 || content.length > 50000) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "Use a title up to 100 characters and a post up to 50,000 characters.",
    });
  }

  const post = {
    id: crypto.randomUUID(),
    title,
    content,
    createdAt: new Date().toISOString(),
  };

  await database
    .prepare(
      "INSERT INTO blog_posts (id, title, content, created_at) VALUES (?, ?, ?, ?)",
    )
    .bind(post.id, post.title, post.content, post.createdAt)
    .run();

  setResponseStatus(event, 201);
  return post;
});
