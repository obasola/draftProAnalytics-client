<script setup lang="ts">
import EspnDraftImportPanel from '../components/EspnDraftImportPanel.vue';
import EspnTeamRosterImportPanel from '../components/EspnTeamRosterImportPanel.vue';
</script>

<template>
  <section class="page">
    <header>
      <h2>ESPN Player and Roster Import</h2>
      <p>Queue complete team-roster imports, draft classes, draft results, and PlayerTeam position enrichment.</p>
    </header>

    <EspnTeamRosterImportPanel />
    <EspnDraftImportPanel />
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
