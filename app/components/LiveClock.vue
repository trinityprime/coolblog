<script setup lang="ts">
const time = ref('')
let timer: ReturnType<typeof setInterval> | undefined

function updateClock() {
  const now = new Date()
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Singapore'
  }

  const parts = new Intl.DateTimeFormat('en-GB', options).formatToParts(now)
  const hour = parts.find((p) => p.type === 'hour')?.value ?? '00'
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00'

  time.value = `${hour}:${minute} SST`
}

onMounted(() => {
  updateClock()
  timer = setInterval(updateClock, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <p id="clock" class="vcr-clock">{{ time }}</p>
</template>
