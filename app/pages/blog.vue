<script setup lang="ts">
type BlogPost = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

const storageKey = "kouvera.blog.posts";
const posts = ref<BlogPost[]>([]);
const title = ref("");
const content = ref("");
const saveMessage = ref("");

useHead({
  title: "kouvera! — blog",
});

function isBlogPost(value: unknown): value is BlogPost {
  if (typeof value !== "object" || value === null) return false;
  const post = value as Record<string, unknown>;

  return (
    typeof post.id === "string" &&
    typeof post.title === "string" &&
    typeof post.content === "string" &&
    typeof post.createdAt === "string"
  );
}

function persistPosts() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(posts.value));
    saveMessage.value = "";
    return true;
  } catch {
    saveMessage.value = "Could not save posts in this browser.";
    return false;
  }
}

onMounted(() => {
  try {
    const savedPosts = localStorage.getItem(storageKey);
    if (!savedPosts) return;

    const parsed: unknown = JSON.parse(savedPosts);
    if (Array.isArray(parsed)) posts.value = parsed.filter(isBlogPost);
  } catch {
    saveMessage.value = "Saved posts could not be read.";
  }
});

function publishPost() {
  const cleanTitle = title.value.trim();
  const cleanContent = content.value.trim();
  if (!cleanTitle || !cleanContent) return;

  posts.value.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title: cleanTitle,
    content: cleanContent,
    createdAt: new Date().toISOString(),
  });

  title.value = "";
  content.value = "";
  persistPosts();
}

function deletePost(id: string) {
  posts.value = posts.value.filter((post) => post.id !== id);
  persistPosts();
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-SG", { dateStyle: "medium" }).format(
    new Date(date),
  );
}
</script>

<template>
  <div class="blog-page">
    <section class="container blog-composer" aria-labelledby="composer-title">
      <h1 id="composer-title">Write a post</h1>

      <form @submit.prevent="publishPost">
        <div class="blog-field">
          <label for="post-title">Title</label>
          <input
            id="post-title"
            v-model="title"
            name="title"
            maxlength="100"
            required
            placeholder="A little something..."
          />
        </div>

        <div class="blog-field">
          <label for="post-content">Your post</label>
          <textarea
            id="post-content"
            v-model="content"
            name="content"
            rows="7"
            required
            placeholder="What's on your mind?"
          ></textarea>
        </div>

        <div class="blog-actions">
          <button class="blog-submit" type="submit">Publish post</button>
          <span class="blog-count">{{ posts.length }} posts</span>
        </div>
      </form>

      <p v-if="saveMessage" class="blog-message" role="status">
        {{ saveMessage }}
      </p>
    </section>

    <section class="container blog-feed" aria-labelledby="blog-title">
      <h1 id="blog-title">The blog</h1>

      <p v-if="posts.length === 0" class="blog-empty">
        Nothing here yet. Your first post starts here.
      </p>

      <article v-for="post in posts" :key="post.id" class="blog-entry">
        <div class="blog-entry-meta">
          <time :datetime="post.createdAt">{{
            formatDate(post.createdAt)
          }}</time>
          <button
            class="blog-delete"
            type="button"
            :aria-label="`Delete ${post.title}`"
            @click="deletePost(post.id)"
          >
            Delete
          </button>
        </div>
        <h2>{{ post.title }}</h2>
        <p class="blog-entry-content">{{ post.content }}</p>
      </article>
    </section>
  </div>
</template>
