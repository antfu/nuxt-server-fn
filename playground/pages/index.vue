<script setup lang="ts">
const fn = useServerFn()
const data = await fn.getCWD()
</script>

<template>
  <div>
    {{ data }}
  </div>
</template>
