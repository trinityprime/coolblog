<template>
  <div>
    <div class="background--custom"></div>
    <div class="site-center">
      <main>
        <SiteHeader />
        <div class="grid">
          <SiteSidebar />

          <div class="content">
            <slot />

            <div class="footer">
              <p>kouvera - 2025, made with ❤ and milo</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
