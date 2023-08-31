<script setup lang="ts">
const fn = useServerFunctions()
const cwd = await fn.getCWD()
const hi = await fn.sayHi('world')
const hi2 = await fn.sayHi('world')
const hi3 = await fn.$cacheless.sayHi('world')
const heyThere = await fn.sayHey()
const heyYou = await fn.sayHey("you")
const hello = await fn.sayHello(200)
</script>

<template>
  <div>
    <div>{{ cwd }}</div>
    <div>{{ hi }}</div>
    <div>{{ hi2 }}</div>
    <div>{{ hi3 }} (nocache)</div>
    <div>{{ heyThere }}</div>
    <div>{{ heyYou }}</div>
    <div>{{ hello }}</div>
  </div>
</template>
