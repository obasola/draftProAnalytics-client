<template>
  <div class="team-item" :class="{ selected }" @click="$emit('toggle')" :title="`${team.city} ${team.name}`">
    <div class="team-info">
      <div class="team-name-circle" :style="{ backgroundColor: team.color }">
        <div class="team-name">{{ team.name }}</div>
      </div>
    </div>

    <div class="team-logo">
      <img v-if="team.logoUrl && !imageError" :src="team.logoUrl" :alt="`${team.city} ${team.name} logo`"
        class="team-logo-img" @error="onImageError" />
      <div v-else class="team-logo-fallback" :style="{ backgroundColor: team.color }">
        {{ team.code }}
      </div>
    </div>

    <div v-if="selected" class="selected-indicator">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Team } from '@/types/teams'

interface Props {
  team: Team
  selected: boolean
}

const props = defineProps<Props>()

defineEmits<{
  toggle: []
}>()

const imageError = ref(false)

const onImageError = (event: Event) => {
  console.warn(`Failed to load team logo: ${props.team.logoUrl}`)
  imageError.value = true
}
</script>

<style scoped>
.team-item {
  display: flex;
  align-items: center;
  justify-content: center;
  /* Center everything horizontally */
  gap: 0.5rem;
  padding: 0.5rem;
  background: #444;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  min-height: 50px;
  position: relative;
}

/* For horizontal 4-column layout within divisions */
.teams-grid.four-columns .team-item {
  flex: 1;
  padding: 0.4rem;
  /* Reduced padding to fit larger elements */
  gap: 0.4rem;
  /* Smaller gap to maximize space for logo and text */
  min-height: 50px;
  /* Keep same height */
  min-width: 0;
  margin: 0;
  background: #4a4a4a;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  /* Prevent any overflow */
}

.teams-grid.four-columns .team-item:hover {
  background: #505050;
}

.teams-grid.four-columns .team-item.selected {
  background: #1e7e34;
}

.team-item:hover {
  background: #4a4a4a;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.team-item.selected {
  background: #1a5d3a;
  border-color: #28a745;
  box-shadow: 0 0 0 1px rgba(40, 167, 69, 0.3);
}

.team-item.selected:hover {
  background: #1e6b42;
}

.team-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  /* Increased from 35px to match text circle */
  height: 50px;
  border-radius: 6px;
  flex-shrink: 0;
  overflow: hidden;
  background: transparent;
}

/* Much larger logos for 4-column layouts */
.teams-grid.four-columns .team-logo {
  width: 80px;
  /* Increased to 80px as requested */
  height: 80px;
  background: transparent;
  /* Transparent background */
}

.team-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: transparent;
  /* Transparent background for image */
  border-radius: 4px;
}

.team-logo-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  color: white;
  font-weight: bold;
  font-size: 0.65rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.team-info {
  flex: 1;
  min-width: 0;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Default circular text container */
.team-name-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

/* For horizontal layout, make larger circular containers */
.teams-grid.four-columns .team-info {
  text-align: center;
  min-width: 0;
  flex: 0 0 auto;
  /* Don't grow, fixed size */
}

.teams-grid.four-columns .team-name-circle {
  width: 80px;
  /* Larger circle for 4-column layout */
  height: 80px;
}

.team-name {
  color: #fff;
  font-size: 0.8rem;
  /* Increased font size */
  font-weight: 700;
  /* Bolder font */
  line-height: 1.1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  /* Better text visibility */
  max-width: 100%;
}

.team-city {
  color: #fff;
  font-size: 0.65rem;
  /* Increased font size */
  font-weight: 600;
  line-height: 1.1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  opacity: 0.9;
  max-width: 100%;
}

/* Larger text for 4-column horizontal layout */
.teams-grid.four-columns .team-name {
  font-size: 0.9rem;
  /* Even larger for 4-column */
  font-weight: 700;
}

.teams-grid.four-columns .team-city {
  font-size: 0.7rem;
  /* Larger city text */
  font-weight: 600;
}

.teams-grid.four-columns .team-logo-fallback {
  font-size: 0.75rem;
  /* Larger fallback text for bigger logo */
  font-weight: 700;
}

/* On very wide screens, we can afford slightly larger text */
@media (min-width: 1400px) {
  .teams-grid.four-columns .team-name {
    font-size: 0.75rem;
  }

  .teams-grid.four-columns .team-city {
    font-size: 0.65rem;
  }
}

.selected-indicator {
  color: #28a745;
  flex-shrink: 0;
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
}

.selected-indicator svg {
  width: 14px;
  height: 14px;
}

/* Compact mode for 4-column team layout */
@media (min-width: 1200px) {
  .four-columns .team-item {
    padding: 0.4rem;
    min-height: 45px;
    gap: 0.3rem;
  }

  .four-columns .team-logo {
    width: 30px;
    height: 30px;
  }

  .four-columns .team-name {
    font-size: 0.7rem;
  }

  .four-columns .team-city {
    font-size: 0.6rem;
  }

  .four-columns .team-logo-fallback {
    font-size: 0.6rem;
  }
}

@media (max-width: 600px) {
  .team-item {
    padding: 0.4rem;
    min-height: 45px;
    gap: 0.4rem;
  }

  .team-logo {
    width: 30px;
    height: 30px;
  }

  .team-name {
    font-size: 0.7rem;
  }

  .team-city {
    font-size: 0.6rem;
  }

  .team-logo-fallback {
    font-size: 0.6rem;
  }
}
</style>

<style scoped>
.team-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #444;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  min-height: 50px;
}

.team-item:hover {
  background: #4a4a4a;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.team-item.selected {
  background: #1a5d3a;
  border-color: #28a745;
  box-shadow: 0 0 0 1px rgba(40, 167, 69, 0.3);
}

.team-item.selected:hover {
  background: #1e6b42;
}

.team-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 6px;
  flex-shrink: 0;
  overflow: hidden;
  background: #555;
}

.team-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: white;
  border-radius: 4px;
}

.team-logo-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 4px;
  color: white;
  font-weight: bold;
  font-size: 0.7rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.team-info {
  flex: 1;
  min-width: 0;
}

.team-name {
  color: #fff;
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.team-city {
  color: #aaa;
  font-size: 0.7rem;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-indicator {
  color: #28a745;
  flex-shrink: 0;
}
</style>

<style scoped>
.team-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #444;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  min-height: 50px;
}

.team-item:hover {
  background: #4a4a4a;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.team-item.selected {
  background: #1a5d3a;
  border-color: #28a745;
  box-shadow: 0 0 0 1px rgba(40, 167, 69, 0.3);
}

.team-item.selected:hover {
  background: #1e6b42;
}

.team-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 6px;
  flex-shrink: 0;
  overflow: hidden;
  background: #555;
}

.team-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: transparent;
  border-radius: 4px;
}

.team-logo-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 4px;
  color: white;
  font-weight: bold;
  font-size: 0.7rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.team-info {
  flex: 1;
  min-width: 0;
}

.team-name {
  color: #fff;
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.team-city {
  color: #aaa;
  font-size: 0.7rem;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-indicator {
  color: #28a745;
  flex-shrink: 0;
}
</style>