<script setup lang="ts">
type BlogPost = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

const posts = ref<BlogPost[]>([]);
const route = useRoute();
const isBlogPostRoute = computed(() => route.path.startsWith("/blog/posts/"));
const title = ref("");
const content = ref("");
const adminKey = ref("");
const saveMessage = ref("");
const loadMessage = ref("");
const isLoading = ref(true);
const isSaving = ref(false);
const isSigningIn = ref(false);
const isAdmin = ref(false);
const showSignIn = ref(false);
const deletingPostId = ref<string | null>(null);
const latestPost = computed(() => posts.value[0]!);

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
  try {
    const session = await $fetch<{ authenticated: boolean }>(
      "/api/blog/session",
    );
    isAdmin.value = session.authenticated;
  } catch {
    isAdmin.value = false;
  }
  await loadPosts();
});

async function signIn() {
  if (!adminKey.value.trim()) return;

  isSigningIn.value = true;
  saveMessage.value = "";

  try {
    await $fetch("/api/blog/session", {
      method: "POST",
      headers: { Authorization: `Bearer ${adminKey.value}` },
    });
    isAdmin.value = true;
    showSignIn.value = false;
    adminKey.value = "";
  } catch (error) {
    saveMessage.value = getErrorMessage(error, "Sign in failed.");
  } finally {
    isSigningIn.value = false;
  }
}

async function signOut() {
  try {
    await $fetch("/api/blog/session", { method: "DELETE" });
    isAdmin.value = false;
  } catch (error) {
    saveMessage.value = getErrorMessage(error, "Sign out failed.");
  }
}

async function publishPost() {
  const cleanTitle = title.value.trim();
  const cleanContent = content.value.trim();
  if (!cleanTitle || !cleanContent || !isAdmin.value) return;

  isSaving.value = true;
  saveMessage.value = "";

  try {
    const post = await $fetch<BlogPost>("/api/blog", {
      method: "POST",
      body: { title: cleanTitle, content: cleanContent },
    });

    posts.value.unshift(post);
    title.value = "";
    content.value = "";
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
    const endpoint: string = `/api/blog/${encodeURIComponent(id)}`;
    await $fetch(endpoint, {
      method: "DELETE",
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

function getExcerpt(postContent: string) {
  const cleanContent = postContent.trim();
  if (cleanContent.length <= 320) return cleanContent;
  return `${cleanContent.slice(0, 320).trimEnd()}...`;
}
</script>

<template>
  <NuxtPage v-if="isBlogPostRoute" />
  <div v-else class="blog-page">
    <section
      v-if="isAdmin"
      class="container blog-composer"
      aria-labelledby="composer-title"
    >
      <div class="blog-owner-heading">
        <h2 id="composer-title" class="blog-form-title">Write a post</h2>
      </div>

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
          <button class="blog-submit" type="submit" :disabled="isSaving">
            {{ isSaving ? "Publishing..." : "Publish post" }}
          </button>
          <span class="blog-count">{{ posts.length }} posts</span>
        </div>
      </form>

      <p v-if="saveMessage" class="blog-message" role="status">
        {{ saveMessage }}
      </p>
    </section>

    <section class="container blog-feed" aria-labelledby="blog-title">
      <div class="blog-banner">
        <img src="/images/asciithread.gif" alt="ascii adventure banner" />
      </div>
      <div class="blog-feed-heading">
        <div>
          <h1 id="blog-title">Welcome to my blog!</h1>
        </div>
        <button
          v-if="!isAdmin"
          class="blog-sign-in-trigger"
          type="button"
          :aria-expanded="showSignIn"
          aria-controls="blog-sign-in-form"
          @click="showSignIn = !showSignIn"
        >
          {{ showSignIn ? "Cancel" : "Owner sign in" }}
        </button>
        <button
          v-else
          class="blog-sign-in-trigger"
          type="button"
          @click="signOut"
        >
          Sign out
        </button>
      </div>

      <form
        v-if="!isAdmin && showSignIn"
        id="blog-sign-in-form"
        class="blog-sign-in-form"
        @submit.prevent="signIn"
      >
        <div class="blog-field">
          <label for="admin-key">Owner key</label>
          <input
            id="admin-key"
            v-model="adminKey"
            type="password"
            autocomplete="current-password"
            placeholder="Your private publishing key"
            required
          />
        </div>
        <div class="blog-actions">
          <button class="blog-submit" type="submit" :disabled="isSigningIn">
            {{ isSigningIn ? "Signing in..." : "Sign in" }}
          </button>
        </div>
        <p v-if="saveMessage" class="blog-message" role="status">
          {{ saveMessage }}
        </p>
      </form>

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

      <div v-else-if="posts.length" class="blog-content-layout">
        <div class="blog-posts">
          <article class="blog-entry blog-entry-latest">
            <div class="blog-entry-meta">
              <span class="blog-latest-label">Latest post</span>
              <time :datetime="latestPost.createdAt">{{
                formatDate(latestPost.createdAt)
              }}</time>
              <button
                v-if="isAdmin"
                class="blog-delete"
                type="button"
                :disabled="deletingPostId === latestPost.id"
                :aria-label="`Delete ${latestPost.title}`"
                @click="deletePost(latestPost.id)"
              >
                {{
                  deletingPostId === latestPost.id ? "Deleting..." : "Delete"
                }}
              </button>
            </div>
            <h2>
              <NuxtLink :to="`/blog/posts/${latestPost.id}`">
                {{ latestPost.title }}
              </NuxtLink>
            </h2>
            <p class="blog-entry-content">
              {{ getExcerpt(latestPost.content) }}
            </p>
            <NuxtLink
              class="blog-read-more"
              :to="`/blog/posts/${latestPost.id}`"
            >
              Read full post <span aria-hidden="true">&rarr;</span>
            </NuxtLink>
          </article>
        </div>

        <aside class="blog-recent" aria-labelledby="recent-posts-title">
          <h2 id="recent-posts-title">Recent posts</h2>
          <ul>
            <li v-for="post in posts" :key="`recent-${post.id}`">
              <NuxtLink :to="`/blog/posts/${post.id}`">
                <time :datetime="post.createdAt">{{
                  formatDate(post.createdAt)
                }}</time>
                <span>{{ post.title }}</span>
              </NuxtLink>
            </li>
          </ul>
        </aside>
      </div>
    </section>
  </div>
</template>
