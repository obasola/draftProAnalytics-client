<template>
    
       <JobsScoreboardPanel class="mt-6" />
    
</template>

<script setup lang="ts">
import JobsScoreboardPanel from '@/components/jobs/JobsScoreboardPanel.vue'
import { onMounted, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useJobsStore } from '@/stores/jobs.store'
import { fmt } from '@/util/date'

// PrimeVue
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import ProgressBar from 'primevue/progressbar'
import Message from 'primevue/message'
import JobStatusTag from '@/components/JobStatusTag.vue'

const jobs = useJobsStore()
const { rows, loading, error } = storeToRefs(jobs)

const team = ref('kc')
function progressPct(d: any) {
  const t = Number(d?.total_records ?? 0)
  const p = Number(d?.processed_records ?? 0)
  if (!t || t < 1) return 0
  const pct = Math.round((p / t) * 100)
  return Math.min(100, Math.max(0, pct))
}
async function refreshNow() { await jobs.refresh(50) }
async function onStartTeams() { await jobs.startTeams() }
async function onStartRoster() { if (team.value) await jobs.startRoster(team.value) }

let timer: any
onMounted(async () => {
  await refreshNow()
  const ms = Number(import.meta.env.VITE_JOBS_REFRESH_MS || 5000)
  timer = setInterval(refreshNow, ms)
})
onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<style scoped>
/* optional tweaks */
</style>
