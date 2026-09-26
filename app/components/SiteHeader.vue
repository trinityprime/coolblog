<script setup lang="ts">
defineProps<{
  mobile?: boolean
}>()

const letters = ['K', '0', 'U', 'V', 'E', 'R', 'A', '!']
</script>

<template>
  <div :class="mobile ? 'header-mobile' : 'header'">
    <h1 v-for="(letter, i) in letters" :key="i" class="jump-text">
      {{ letter }}
    </h1>
  </div>
</template>
