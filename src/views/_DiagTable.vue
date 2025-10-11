<script setup lang="ts">
import { computed } from 'vue'
const rows = computed(() => Array.from({ length: 25 }, (_, i) => ({ __key: `row-${i}`, i })))
</script>

<template>
  <div style="padding:16px">
    <h3>Diagnostic Table (should show 25 rows)</h3>
    <table class="diag">
      <thead><tr><th>#</th><th>Text</th></tr></thead>
      <tbody>
        <tr v-for="r in rows" :key="r.__key">
          <td>{{ r.i + 1 }}</td>
          <td>Row {{ r.i + 1 }}</td>
        </tr>
      </tbody>
    </table>
    <div>rows detected: {{ rows.length }}</div>
  </div>
</template>

<style scoped>
:deep(table),
:deep(thead),
:deep(tbody),
:deep(tr),
:deep(td),
:deep(th) { display: revert !important; }

:deep(tbody) { max-height: none !important; height: auto !important; overflow: visible !important; }
:deep(tbody > tr) { height: auto !important; overflow: visible !important; }

.diag { width: 100%; border-collapse: collapse; }
.diag th, .diag td { border: 1px solid #ccc; padding: 4px 6px; }
</style>
