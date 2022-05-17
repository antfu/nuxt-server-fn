<script setup lang="ts">
const fn = useServerFn()
const cwd = await fn.getCWD()
const hi = await fn.sayHi('world')
</script>

<template>
  <div>
    <div>{{ cwd }}</div>
    <div>{{ hi }}</div>
  </div>
</template>
