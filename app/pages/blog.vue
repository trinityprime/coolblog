<script setup lang="ts">
type BlogPost = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

type BlogStatus = {
  message: string;
  updatedAt: string | null;
};

const posts = ref<BlogPost[]>([]);
const title = ref("");
const content = ref("");
const adminKey = ref("");
const blogStatus = ref("");
const blogStatusDraft = ref("");
const statusUpdatedAt = ref<string | null>(null);
const saveMessage = ref("");
const loadMessage = ref("");
const statusMessage = ref("");
const isLoading = ref(true);
const isSaving = ref(false);
const isSavingStatus = ref(false);
const isSigningIn = ref(false);
const isAdmin = ref(false);
const showSignIn = ref(false);
const showStatusEditor = ref(false);
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

async function loadBlogStatus() {
  try {
    const status = await $fetch<BlogStatus>("/api/blog/status");
    blogStatus.value = status.message;
    statusUpdatedAt.value = status.updatedAt;
    blogStatusDraft.value = status.message;
  } catch {
    statusMessage.value = "The status could not be loaded.";
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
  await Promise.all([loadPosts(), loadBlogStatus()]);
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
    showStatusEditor.value = false;
  } catch (error) {
    saveMessage.value = getErrorMessage(error, "Sign out failed.");
  }
}

async function saveBlogStatus() {
  const message = blogStatusDraft.value.trim();
  if (!message) return;

  isSavingStatus.value = true;
  statusMessage.value = "";

  try {
    const status = await $fetch<BlogStatus>("/api/blog/status", {
      method: "PUT",
      body: { message },
    });
    blogStatus.value = status.message;
    statusUpdatedAt.value = status.updatedAt;
    showStatusEditor.value = false;
  } catch (error) {
    statusMessage.value = getErrorMessage(error, "The status could not be saved.");
  } finally {
    isSavingStatus.value = false;
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
    await $fetch(`/api/blog/${encodeURIComponent(id)}`, {
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
</script>

<template>
  <div class="blog-page">
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
      <div class="blog-feed-heading">
        <div>
          <p class="blog-kicker">A PERSONAL LOG</p>
          <h1 id="blog-title">Welcome to my blog</h1>
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
        <button v-else class="blog-sign-in-trigger" type="button" @click="signOut">
          Sign out
        </button>
      </div>

      <div class="blog-status-bar" aria-label="Current status">
        <span class="blog-status-dot" aria-hidden="true"></span>
        <span class="blog-status-label">STATUS</span>
        <p>{{ blogStatus || "No status update" }}</p>
        <time v-if="statusUpdatedAt" :datetime="statusUpdatedAt">
          {{ formatDate(statusUpdatedAt) }}
        </time>
        <button
          v-if="isAdmin"
          class="blog-status-edit"
          type="button"
          :aria-expanded="showStatusEditor"
          aria-controls="blog-status-editor"
          @click="showStatusEditor = !showStatusEditor"
        >
          {{ showStatusEditor ? "Close" : "Edit" }}
        </button>
      </div>

      <form
        v-if="isAdmin && showStatusEditor"
        id="blog-status-editor"
        class="blog-status-editor"
        @submit.prevent="saveBlogStatus"
      >
        <label for="blog-status-input">Status</label>
        <div class="blog-status-controls">
          <input
            id="blog-status-input"
            v-model="blogStatusDraft"
            maxlength="180"
            required
            placeholder="What are you up to?"
          />
          <button class="blog-submit" type="submit" :disabled="isSavingStatus">
            {{ isSavingStatus ? "Saving..." : "Update" }}
          </button>
        </div>
        <p v-if="statusMessage" class="blog-message" role="status">
          {{ statusMessage }}
        </p>
      </form>

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

      <p v-if="statusMessage && !showStatusEditor" class="blog-message" role="status">
        {{ statusMessage }}
      </p>

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
          <article
            v-for="(post, index) in posts"
            :id="`blog-post-${post.id}`"
            :key="post.id"
            class="blog-entry"
            :class="{ 'blog-entry-latest': index === 0 }"
          >
            <div class="blog-entry-meta">
              <span v-if="index === 0" class="blog-latest-label">Latest post</span>
              <time :datetime="post.createdAt">{{ formatDate(post.createdAt) }}</time>
              <button
                v-if="isAdmin"
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
        </div>

        <aside class="blog-recent" aria-labelledby="recent-posts-title">
          <h2 id="recent-posts-title">Recent posts</h2>
          <ul>
            <li v-for="post in posts" :key="`recent-${post.id}`">
              <a :href="`#blog-post-${post.id}`">
                <time :datetime="post.createdAt">{{ formatDate(post.createdAt) }}</time>
                <span>{{ post.title }}</span>
              </a>
            </li>
          </ul>
        </aside>
      </div>
    </section>
  </div>
</template>
