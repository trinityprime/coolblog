<script setup lang="ts">
const menuOpen = ref(false);

function toggleMenu() {
  menuOpen.value = !menuOpen.value;
}
</script>

<template>
  <div class="sidebar">
    <div class="horizontal-containers">
      <SiteHeader mobile />

      <button
        id="hamburger"
        class="hamburger"
        :class="{ active: menuOpen }"
        :aria-expanded="menuOpen"
        aria-controls="mobileNav"
        :aria-label="menuOpen ? 'Close navigation' : 'Open navigation'"
        @click="toggleMenu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <LiveClock />
    </div>

    <div class="socials">
      <a
        href="https://steamcommunity.com/profiles/76561198379555024"
        class="steam"
        target="_blank"
      ></a>
      <a
        href="https://github.com/trinityprime"
        class="github"
        target="_blank"
      ></a>
      <a
        href="https://discordapp.com/users/451942620411985940"
        class="discord"
        target="_blank"
      ></a>
      <a href="mailto:limkl.ryan@gmail.com" class="email"></a>
    </div>

    <nav id="mobileNav" class="mobile-nav" :class="{ open: menuOpen }">
      <ul>
        <li><NuxtLink to="/">home</NuxtLink></li>
        <li><NuxtLink to="/blog">blog</NuxtLink></li>
        <li><NuxtLink to="/credits">credits</NuxtLink></li>
      </ul>
    </nav>

    <nav class="desktop-nav">
      <h1>DASHBOARD</h1>
      <div class="nav-links">
        <li><NuxtLink to="/">Home</NuxtLink></li>
      </div>
      <div class="nav-links">
        <li><NuxtLink to="/blog">Blog</NuxtLink></li>
      </div>
      <div class="nav-links">
        <li><NuxtLink to="/credits">Credits</NuxtLink></li>
      </div>
    </nav>
  </div>
</template>
