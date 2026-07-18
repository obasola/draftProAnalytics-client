<script setup lang="ts">
import EspnTeamRosterImportPanel from '../components/EspnTeamRosterImportPanel.vue'
</script>

<template>
  <section class="page">
    <header>
      <h2>Import Team Roster</h2>
      <p>
        Queue complete ESPN roster imports for one selected team or every configured NFL team.
      </p>
    </header>

    <EspnTeamRosterImportPanel />
  </section>
</template>

<style scoped>
.page,
header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

header {
  gap: 0.35rem;
}

h2,
p {
  margin: 0;
}
</style>
