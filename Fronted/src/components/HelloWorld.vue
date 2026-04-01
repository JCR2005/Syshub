<template>
  <section>
    <p>Count: {{ count }}</p>
    <button @click="increment">Increment</button>
  </section>
</template>

<script setup>
import { ref } from 'vue'
const count = ref(0)
function increment() {
  count.value++
}
</script>

<style scoped>
section { margin-top: 1rem; }
button { padding: 0.5rem 1rem; }
</style>
