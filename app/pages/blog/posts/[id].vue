<script setup lang="ts">
type BlogPost = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

const route = useRoute();
const post = ref<BlogPost | null>(null);
const posts = ref<BlogPost[]>([]);
const isLoading = ref(true);
const loadMessage = ref("");

useHead(() => ({
  title: post.value ? `${post.value.title} — kouvera! blog` : "kouvera! — blog",
}));

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error !== "object" || error === null) return fallback;
  const apiError = error as {
    data?: { statusMessage?: string };
    message?: string;
  };

  return apiError.data?.statusMessage ?? apiError.message ?? fallback;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-SG", { dateStyle: "medium" }).format(
    new Date(date),
  );
}

const postIndex = computed(() =>
  posts.value.findIndex((entry) => entry.id === post.value?.id),
);
const newerPost = computed(() =>
  postIndex.value > 0 ? posts.value[postIndex.value - 1] : null,
);
const olderPost = computed(() =>
  postIndex.value >= 0 ? posts.value[postIndex.value + 1] : null,
);

async function loadPost() {
  isLoading.value = true;
  loadMessage.value = "";
  post.value = null;

  const id = String(route.params.id ?? "");
  try {
    post.value = await $fetch<BlogPost>(`/api/blog/${encodeURIComponent(id)}`);
  } catch (error) {
    loadMessage.value = getErrorMessage(
      error,
      "This post could not be loaded.",
    );
  }

  try {
    posts.value = await $fetch<BlogPost[]>("/api/blog");
  } catch {
    posts.value = [];
  }

  isLoading.value = false;
}

onMounted(loadPost);
watch(() => route.params.id, loadPost);
</script>

<template>
  <section class="container blog-article-page" aria-labelledby="article-title">
    <nav class="blog-article-topnav" aria-label="Blog navigation">
      <NuxtLink to="/blog">&larr; All posts</NuxtLink>
    </nav>

    <p v-if="isLoading" class="blog-empty">Loading post...</p>

    <div v-else-if="!post" class="blog-empty" role="alert">
      <p>{{ loadMessage || "This post could not be found." }}</p>
      <NuxtLink to="/blog">Return to all posts</NuxtLink>
    </div>

    <article v-else class="blog-article">
      <header class="blog-article-header">
        <h1 id="article-title">{{ post.title }}</h1>
        <time :datetime="post.createdAt">{{ formatDate(post.createdAt) }}</time>
      </header>

      <div class="blog-article-content">{{ post.content }}</div>

      <nav class="blog-post-navigation" aria-label="Other blog posts">
        <NuxtLink v-if="newerPost" :to="`/blog/posts/${newerPost.id}`">
          <span>Newer post</span>
          {{ newerPost.title }}
        </NuxtLink>
        <NuxtLink class="blog-all-posts-link" to="/blog"> All posts </NuxtLink>
        <NuxtLink v-if="olderPost" :to="`/blog/posts/${olderPost.id}`">
          <span>Older post</span>
          {{ olderPost.title }}
        </NuxtLink>
      </nav>
    </article>
  </section>
</template>
