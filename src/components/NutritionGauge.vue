<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
  current: number
  recommended: number
  unit: string
  color: string
}

const props = defineProps<Props>()

const rawPercentage = computed(() => (props.current / props.recommended) * 100)
const displayPercentage = computed(() => Math.round(rawPercentage.value))
const barPercentage = computed(() => Math.min(rawPercentage.value, 100))
const isOver = computed(() => props.current > props.recommended)
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <span class="text-sm text-gray-700">{{ label }}</span>
      <span class="text-sm">
        <span :class="isOver ? 'text-red-600' : 'text-emerald-600'">
          {{ current }}{{ unit }}
        </span>
        <span class="text-gray-400"> / {{ recommended }}{{ unit }}</span>
      </span>
    </div>
    <div class="relative h-3 bg-gray-200 rounded-full overflow-hidden">
      <div
        v-motion
        :initial="{ width: '0%' }"
        :enter="{ width: `${barPercentage}%`, transition: { duration: 1000, delay: 200 } }"
        :class="['h-full rounded-full', isOver ? 'bg-red-500' : color]"
      ></div>
    </div>
    <div class="text-right text-xs text-gray-500">
      {{ displayPercentage }}%
    </div>
  </div>
</template>
