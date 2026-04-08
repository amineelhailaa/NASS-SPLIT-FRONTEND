<script setup>

defineProps({
  message: String
})
</script>

<template>
<p v-if="message" class="text-red-600 text-xs pl-4 pt-1">{{ message}}</p>
</template>

<style scoped>

</style>