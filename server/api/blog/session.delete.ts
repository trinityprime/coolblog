import { defineEventHandler } from "h3";
import { endBlogAdminSession } from "../../utils/blog-database";

export default defineEventHandler((event) => {
  endBlogAdminSession(event);
  return { authenticated: false };
});
