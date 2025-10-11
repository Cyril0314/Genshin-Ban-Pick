<!-- src/features/RoomUserPool/RoomUserPool.vue -->

<script setup lang="ts">
import { useRoomUsers } from './composables/useRoomUsers.ts'

const { roomUsers } = useRoomUsers()

</script>


<template>
    <div class="container__users">
    </div>
  </template>

<style scoped>

</style>