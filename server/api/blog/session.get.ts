import { defineEventHandler } from "h3";
import { hasBlogAdminSession } from "../../utils/blog-database";

export default defineEventHandler(async (event) => ({
  authenticated: await hasBlogAdminSession(event),
}));
