<script setup lang="ts">
interface Patch {
  version: string
  date: string
  notes: string[]
}

const patches: Patch[] = [
  {
    version: 'v1.1.3',
    date: '09-09-25',
    notes: ['changed website name, reorganised files']
  },
  {
    version: 'v1.1.2',
    date: '01-09-25',
    notes: ['added socials']
  },
  {
    version: 'v1.1.1',
    date: '30-08-25',
    notes: ['added mobile responsiveness']
  },
  {
    version: 'v1.1',
    date: '29-08-25',
    notes: ['added credits page']
  },
  {
    version: 'v1.0',
    date: '28-08-25',
    notes: ['inital release']
  }
]
</script>

<template>
  <ul id="patch-notes">
    <li v-for="patch in patches" :key="patch.version">
      <strong>{{ patch.version }} - {{ patch.date }}:</strong>
      {{ patch.notes.join(', ') }}
    </li>
  </ul>
</template>
