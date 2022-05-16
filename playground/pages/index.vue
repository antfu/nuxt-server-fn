<script setup lang="ts">
const fn = useServerFn()
const data = await fn.getCWD()
const hi = await fn.sayHi('Hello')
</script>

<template>
  <div>
    {{ data }}
    {{ hi }}
  </div>
</template>
