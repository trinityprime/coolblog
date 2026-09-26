import { defineEventHandler } from "h3";
import { getBlogDatabase } from "../../utils/blog-database";

type BlogPostRow = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

export default defineEventHandler(async (event) => {
  const { results } = await getBlogDatabase(event)
    .prepare(
      "SELECT id, title, content, created_at AS createdAt FROM blog_posts ORDER BY created_at DESC, id DESC",
    )
    .all<BlogPostRow>();

  return results;
});
