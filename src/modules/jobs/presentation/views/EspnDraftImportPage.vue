<script setup lang="ts">import EspnDraftImportPanel from '../components/EspnDraftImportPanel.vue';</script>
<template><section class="page"><header><h2>ESPN Draft Data Import</h2><p>Queue year-based draft-class and post-draft result imports through the standard Job Queue.</p></header><EspnDraftImportPanel/></section></template>
<style scoped>.page,header{display:flex;flex-direction:column;gap:1rem}header{gap:.35rem}h2,p{margin:0}</style>
