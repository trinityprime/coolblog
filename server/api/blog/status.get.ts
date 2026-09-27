import { defineEventHandler } from "h3";
import { getBlogDatabase } from "../../utils/blog-database";

type BlogStatusRow = {
  message: string;
  updatedAt: string;
};

export default defineEventHandler(async (event) => {
  const { results } = await getBlogDatabase(event)
    .prepare(
      "SELECT message, updated_at AS updatedAt FROM blog_status WHERE id = 'current'",
    )
    .all<BlogStatusRow>();

  return {
    message: results[0]?.message ?? "",
    updatedAt: results[0]?.updatedAt ?? null,
  };
});