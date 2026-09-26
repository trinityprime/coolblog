import { createError, defineEventHandler, getRouterParam } from "h3";
import { requireBlogAdmin } from "../../utils/blog-database";

export default defineEventHandler(async (event) => {
  const database = requireBlogAdmin(event);
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "A post ID is required.",
    });
  }

  const result = await database
    .prepare("DELETE FROM blog_posts WHERE id = ?")
    .bind(id)
    .run();

  if (result.meta?.changes === 0) {
    throw createError({ statusCode: 404, statusMessage: "Post not found." });
  }

  return { ok: true };
});
