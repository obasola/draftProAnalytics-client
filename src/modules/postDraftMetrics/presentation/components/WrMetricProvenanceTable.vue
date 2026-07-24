<script setup lang="ts">
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import { computed } from 'vue'
import type { ResolvedWrMetrics, WrMetricKey } from '../../domain/WrMetricTypes'
const props = defineProps<{ metrics: ResolvedWrMetrics | null }>()
const labels: Record<WrMetricKey,string> = {
  yardsPerRouteRun:'Yards per Route Run', receivingGrade:'Receiving Grade', contestedCatchRate:'Contested-Catch Rate', behindLosTargetRate:'Behind-LOS Target Rate', catchRate:'Catch Rate', missedTacklesForcedPerReception:'Missed Tackles Forced per Reception', yacAfterContactPerReception:'YAC After Contact per Reception'
}
const keys = Object.keys(labels) as WrMetricKey[]
const rows = computed(() => keys.map(key => ({ key, label: labels[key], ...(props.metrics?.[key] ?? { value: null }) })))
</script>
<template>
  <DataTable :value="rows" stripedRows responsiveLayout="scroll" dataKey="key">
    <Column field="label" header="Metric" />
    <Column header="Resolved Value"><template #body="{data}">{{ data.value ?? 'Missing' }}</template></Column>
    <Column field="sourceName" header="Source Name" />
    <Column field="sourceType" header="Source Type" />
    <Column header="Verified"><template #body="{data}"><Tag :value="data.verified ? 'Verified' : 'Unverified'" :severity="data.verified ? 'success' : 'warning'" /></template></Column>
    <Column field="recordId" header="Record ID" />
    <Column field="providerPriority" header="Priority" />
    <Column field="seasonYear" header="Season" />
    <Column field="sourceReference" header="Reference" />
    <Column field="resolutionSource" header="Resolution" />
  </DataTable>
</template>
