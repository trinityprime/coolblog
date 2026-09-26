<script setup lang="ts">
type BlogPost = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

const adminKeyStorageKey = "kouvera.blog.admin-key";
const posts = ref<BlogPost[]>([]);
const title = ref("");
const content = ref("");
const adminKey = ref("");
const saveMessage = ref("");
const loadMessage = ref("");
const isLoading = ref(true);
const isSaving = ref(false);
const deletingPostId = ref<string | null>(null);

useHead({
  title: "kouvera! — blog",
});

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error !== "object" || error === null) return fallback;
  const apiError = error as {
    data?: { statusMessage?: string };
    message?: string;
  };

  return apiError.data?.statusMessage ?? apiError.message ?? fallback;
}

async function loadPosts() {
  isLoading.value = true;
  loadMessage.value = "";

  try {
    posts.value = await $fetch<BlogPost[]>("/api/blog");
  } catch (error) {
    loadMessage.value = getErrorMessage(
      error,
      "Posts could not be loaded. Check the Cloudflare D1 setup.",
    );
  } finally {
    isLoading.value = false;
  }
}

onMounted(async () => {
  adminKey.value = sessionStorage.getItem(adminKeyStorageKey) ?? "";
  await loadPosts();
});

async function publishPost() {
  const cleanTitle = title.value.trim();
  const cleanContent = content.value.trim();
  if (!cleanTitle || !cleanContent || !adminKey.value.trim()) return;

  isSaving.value = true;
  saveMessage.value = "";

  try {
    const post = await $fetch<BlogPost>("/api/blog", {
      method: "POST",
      headers: { Authorization: `Bearer ${adminKey.value}` },
      body: { title: cleanTitle, content: cleanContent },
    });

    posts.value.unshift(post);
    title.value = "";
    content.value = "";
    sessionStorage.setItem(adminKeyStorageKey, adminKey.value);
  } catch (error) {
    saveMessage.value = getErrorMessage(
      error,
      "The post could not be published.",
    );
  } finally {
    isSaving.value = false;
  }
}

async function deletePost(id: string) {
  deletingPostId.value = id;
  saveMessage.value = "";

  try {
    await $fetch(`/api/blog/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminKey.value}` },
    });
    posts.value = posts.value.filter((post) => post.id !== id);
  } catch (error) {
    saveMessage.value = getErrorMessage(
      error,
      "The post could not be deleted.",
    );
  } finally {
    deletingPostId.value = null;
  }
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
      <h1 id="composer-title">Owner access</h1>

      <div class="blog-field">
        <label for="admin-key">Owner key</label>
        <input
          id="admin-key"
          v-model="adminKey"
          type="password"
          autocomplete="current-password"
          placeholder="Your private publishing key"
        />
      </div>

      <form v-if="adminKey.trim()" @submit.prevent="publishPost">
        <h2 class="blog-form-title">Write a post</h2>
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
          <button class="blog-submit" type="submit" :disabled="isSaving">
            {{ isSaving ? "Publishing..." : "Publish post" }}
          </button>
          <span class="blog-count">{{ posts.length }} posts</span>
        </div>
      </form>

      <p v-else class="blog-help">
        Enter your owner key to publish or manage posts.
      </p>

      <p v-if="saveMessage" class="blog-message" role="status">
        {{ saveMessage }}
      </p>
    </section>

    <section class="container blog-feed" aria-labelledby="blog-title">
      <h1 id="blog-title">The blog</h1>

      <p v-if="isLoading" class="blog-empty">Loading posts...</p>

      <p v-else-if="loadMessage" class="blog-message" role="alert">
        {{ loadMessage }}
        <button class="blog-delete" type="button" @click="loadPosts">
          Try again
        </button>
      </p>

      <p v-else-if="posts.length === 0" class="blog-empty">
        Nothing here yet. Your first post starts here.
      </p>

      <article v-for="post in posts" :key="post.id" class="blog-entry">
        <div class="blog-entry-meta">
          <time :datetime="post.createdAt">{{
            formatDate(post.createdAt)
          }}</time>
          <button
            v-if="adminKey.trim()"
            class="blog-delete"
            type="button"
            :disabled="deletingPostId === post.id"
            :aria-label="`Delete ${post.title}`"
            @click="deletePost(post.id)"
          >
            {{ deletingPostId === post.id ? "Deleting..." : "Delete" }}
          </button>
        </div>
        <h2>{{ post.title }}</h2>
        <p class="blog-entry-content">{{ post.content }}</p>
      </article>
    </section>
  </div>
</template>
