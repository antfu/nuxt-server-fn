<script setup lang="ts">
const fn = useServerFunctions()
const cwd = await fn.getCWD()
const hi = await fn.sayHi('world')
const hi2 = await fn.sayHi('world')
const hi3 = await fn.$cacheless.sayHi('world')
</script>

<template>
  <div>
    <div>{{ cwd }}</div>
    <div>{{ hi }}</div>
    <div>{{ hi2 }}</div>
    <div>{{ hi3 }} (nocache)</div>
  </div>
</template>
