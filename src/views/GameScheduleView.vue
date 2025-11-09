<template>
  
    <div class="game-detail-view">

      <!-- Show read-only view -->
      <Schedule :defaultSeason="'2025'" :defaultTeam="'league'" />
    </div>
  
</template>

<script setup lang="ts">
import Schedule from '@/components/game/GameSchedule.vue'
import AppLayout from '@/components/ui/AppLayout.vue'
</script>

<style scoped>
.schedule-view {
  min-height: 100vh;
  background: #f8f9fa;
}

.view-header {
  background: white;
  border-bottom: 1px solid #dee2e6;
  padding: 1.5rem 2rem;
  margin-bottom: 0;
}

.view-header h1 {
  margin: 0 0 0.5rem 0;
  color: #212529;
  font-size: 2rem;
  font-weight: 600;
}

.breadcrumb {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #6c757d;
}

.breadcrumb-link {
  color: #007bff;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  color: #0056b3;
  text-decoration: underline;
}

.breadcrumb-separator {
  margin: 0 0.5rem;
  color: #6c757d;
}

.breadcrumb-current {
  color: #495057;
  font-weight: 500;
}

.view-content {
  padding: 0;
  max-width: 100%;
}

/* Responsive design */
@media (max-width: 768px) {
  .view-header {
    padding: 1rem;
  }

  .view-header h1 {
    font-size: 1.5rem;
  }

  .view-content {
    padding: 0;
  }
}
</style>
