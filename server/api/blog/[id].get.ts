import { createError, defineEventHandler, getRouterParam } from "h3";
import { getBlogDatabase } from "../../utils/blog-database";

type BlogPostRow = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "A post ID is required.",
    });
  }

  const { results } = await getBlogDatabase(event)
    .prepare(
      "SELECT id, title, content, created_at AS createdAt FROM blog_posts WHERE id = ? LIMIT 1",
    )
    .bind(id)
    .all<BlogPostRow>();

  const post = results[0];
  if (!post) {
    throw createError({ statusCode: 404, statusMessage: "Post not found." });
  }

  return post;
});
