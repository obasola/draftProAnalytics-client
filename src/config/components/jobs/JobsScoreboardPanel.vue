// =============================
// File: src/components/jobs/JobsScoreboardPanel.vue
// =============================
<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useJobsStore } from '@/stores/jobs.store'

interface JobRow {
    started_at?: string | null
    completed_at?: string | null
    // add other fields if you want strict typing
}

// PrimeVue
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import ProgressBar from 'primevue/progressbar'
import Message from 'primevue/message'
import JobStatusTag from '@/components/JobStatusTag.vue'
import AppLayout from '@/components/ui/AppLayout.vue'


import { useToast } from 'primevue/usetoast'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import MultiSelect from 'primevue/multiselect'
import Card from 'primevue/card'
import Divider from 'primevue/divider'
import InputSwitch from 'primevue/inputswitch'

import { JobsApi, ScoreboardSyncResult } from '@/services/api'
import { useScoreboardStore } from '@/stores/scoreboardScoreStore'

const jobs = useJobsStore()
const { rows, loading, error } = storeToRefs(jobs)

const team = ref('kc')

const toast = useToast()
const sb = useScoreboardStore()
const useJobQueue = ref(false)


// Manual refresh controls
const date = ref<Date | null>(new Date()) // default "today"

const seasons = computed(() => {
    const y = new Date().getFullYear()
    return Array.from({ length: 6 }, (_, i) => y - 2 + i) // y-2 .. y+3
})

const season = ref<number>(new Date().getFullYear())
const seasonType = ref<1 | 2 | 3>(2) // 1=pre, 2=reg, 3=post
const week = ref<number>(1)

const seasonTypeOptions = [
    { label: 'Preseason', value: 1 },
    { label: 'Regular', value: 2 },
    { label: 'Postseason', value: 3 },
]

const dayOptions = [
    { label: 'Sun', value: 'SUN' },
    { label: 'Mon', value: 'MON' },
    { label: 'Tue', value: 'TUE' },
    { label: 'Wed', value: 'WED' },
    { label: 'Thu', value: 'THU' },
    { label: 'Fri', value: 'FRI' },
    { label: 'Sat', value: 'SAT' },
]

const lastResult = ref<ScoreboardSyncResult | null>(null)

function fmtYmd(d: Date) {
    const y = d.getFullYear()
    const m = (d.getMonth() + 1).toString().padStart(2, '0')
    const dd = d.getDate().toString().padStart(2, '0')
    return `${y}${m}${dd}`
}

async function runByDate() {
    if (!date.value) return
    try {
        const ymd = fmtYmd(date.value)
        const res = await sb.refreshByDate(ymd)
        toast.add({ severity: 'success', summary: 'Scoreboard', detail: `Refreshed ${ymd} (processed ${res.processed}, failed ${res.failed})`, life: 4000 })
    } catch (e: any) {
        toast.add({ severity: 'error', summary: 'Scoreboard', detail: e?.message ?? 'Failed', life: 5000 })
    }
}

async function runByWeek() {
  try {
    if (useJobQueue.value) {
      // Use Job queue endpoint
      const res = await JobsApi.kickoffScoreboardByWeek(
        season.value,
        seasonType.value,
        week.value
      )
      toast.add({
        severity: 'info',
        summary: 'Job queued',
        detail: `Job #${res.id} started for ${season.value} week ${week.value}`,
        life: 4000,
      })
      await jobs.refresh(50)
    } else {
      // Run directly (manual refresh)
      const res = await sb.refreshByWeek(season.value, seasonType.value, week.value)
      toast.add({
        severity: 'success',
        summary: 'Scoreboard',
        detail: `Refreshed ${season.value}-W${week.value} (processed ${res.processed}, failed ${res.failed})`,
        life: 4000,
      })
    }
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'Scoreboard',
      detail: e?.message ?? 'Failed',
      life: 5000,
    })
  }
}


async function saveSchedule() {
    try {
        await sb.saveSchedule()
        toast.add({ severity: 'success', summary: 'Schedule', detail: 'Saved', life: 3000 })
    } catch (e: any) {
        toast.add({ severity: 'error', summary: 'Schedule', detail: e?.message ?? 'Failed to save', life: 5000 })
    }
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
onMounted(() => sb.loadSchedule())
function progressPct(d: any) {
    const t = Number(d?.total_records ?? 0)
    const p = Number(d?.processed_records ?? 0)
    if (!t || t < 1) return 0
    const pct = Math.round((p / t) * 100)
    return Math.min(100, Math.max(0, pct))
}
onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<template>
    <AppLayout>
        <div class="p-4 space-y-4">
            <div class="flex items-center justify-between gap-2">
                <div class="text-2xl font-semibold">Jobs</div>
                <div class="flex items-center gap-2">
                    <InputText v-model="team" placeholder="Team (abbr or id)" class="w-40" />
                    <Button label="Start Team Sync" icon="pi pi-users" @click="onStartTeams" />
                    <Button label="Start Roster" icon="pi pi-play" severity="secondary" @click="onStartRoster" />
                    <Button label="Refresh" icon="pi pi-refresh" severity="contrast" @click="refreshNow" />
                </div>
            </div>
            <div v-if="useJobQueue">
                <DataTable :value="rows" :loading="loading" dataKey="id" paginator :rows="15" size="small">
                    <Column field="id" header="#" style="width: 80px" />
                    <Column field="job_type" header="Type" style="width: 140px" />
                    <Column header="Status" style="width: 140px">
                        <template #body="{ data }">
                            <JobStatusTag :status="data.status" />
                        </template>
                    </Column>
                    <Column header="Progress">
                        <template #body="{ data }">
                            <div class="flex items-center gap-2">
                                <ProgressBar :value="progressPct(data)" style="width: 12rem" />
                                <span class="text-xs">
                                    {{ data.processed_records ?? 0 }} / {{ data.total_records ?? '?' }}
                                    <span v-if="data.failed_records"> (failed: {{ data.failed_records }})</span>
                                </span>
                            </div>
                        </template>
                    </Column>
                    <Column field="started_at" header="Started" :body="(d: JobRow) => fmt(d.started_at)"
                        style="width: 180px" />
                    <Column field="completed_at" header="Completed" :body="(d: JobRow) => fmt(d.completed_at)"
                        style="width: 180px" />
                    <Column header="Error">
                        <template #body="{ data }">
                            <span class="text-red-600 text-sm" v-if="data.error_message">{{ data.error_message }}</span>
                            <span class="text-muted-color" v-else>—</span>
                        </template>
                    </Column>
                </DataTable>

                <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
            </div>
            <div v-else>
                <Message severity="info" icon="pi pi-bolt">
                    Manual refresh runs immediately — results appear below.
                </Message>
                <Card v-if="lastResult" class="mt-3">
                    <template #title>Last Sync Summary</template>
                    <template #content>
                        <p>Season: {{ lastResult.season }} &nbsp;Type: {{ lastResult.seasonType }} &nbsp;Week: {{
                            lastResult.week }}</p>
                        <p>Processed: {{ lastResult.processed }} &nbsp;Failed: {{ lastResult.failed }}</p>
                    </template>
                </Card>
            </div>

            <Card class="mt-4">
                <template #title>Scoreboard Sync</template>
                <template #subtitle>ESPN league-wide results → MyNFL.Game</template>

                <template #content>
                    <div class="grid gap-4 md:grid-cols-2">
                        <!-- Manual: by Date -->
                        <div class="p-4 border rounded-lg">
                            <h3 class="font-semibold mb-3">Manual refresh by date</h3>
                            <div class="flex items-center gap-3">
                                <Calendar v-model="date" dateFormat="yy-mm-dd" showIcon />
                                <Button :loading="sb.loading" label="Refresh" icon="pi pi-refresh" @click="runByDate" />
                            </div>
                            <small class="text-color-secondary">Uses /jobs/kickoff/scoreboard/by-date</small>
                        </div>

                        <div class="flex items-center gap-2 mb-3">
                            <span>Use Job Queue</span>
                            <InputSwitch v-model="useJobQueue" />
                        </div>

                        <!-- Manual: by Week -->
                        <div class="p-4 border rounded-lg">
                            <h3 class="font-semibold mb-3">Manual refresh by week</h3>
                            <div class="flex flex-wrap items-center gap-3">
                                <Dropdown v-model="season" :options="seasons" optionLabel="" :placeholder="'Season'" />
                                <Dropdown v-model="seasonType" :options="seasonTypeOptions" optionLabel="label"
                                    optionValue="value" />
                                <Dropdown v-model="week" :options="Array.from({ length: 22 }, (_, i) => i + 1)"
                                    placeholder="Week" />
                                <Button :loading="sb.loading" label="Refresh" icon="pi pi-refresh" @click="runByWeek" />
                            </div>
                            <small class="text-color-secondary">Uses /jobs/kickoff/scoreboard/by-week</small>
                        </div>
                    </div>

                    <Divider />

                    <!-- Scheduling -->
                    <div class="p-4 border rounded-lg">
                        <h3 class="font-semibold mb-3">Automatic schedule</h3>
                        <div class="flex flex-wrap items-center gap-4">
                            <div class="flex items-center gap-2">
                                <span>Enabled</span>
                                <InputSwitch v-model="sb.schedule.enabled" />
                            </div>

                            <MultiSelect v-model="sb.schedule.days" :options="dayOptions" optionLabel="label"
                                optionValue="value" display="chip" class="min-w-64" placeholder="Days" />

                            <Dropdown v-model="sb.schedule.hour" :options="Array.from({ length: 24 }, (_, i) => i)"
                                placeholder="Hour" />
                            <Dropdown v-model="sb.schedule.minute" :options="[0, 5, 10, 15, 20, 30, 45]"
                                placeholder="Minute" />

                            <!-- Simple hour/min controls to avoid complex time-only binding -->
                            <Dropdown v-model="sb.schedule.hour" :options="Array.from({ length: 24 }, (_, i) => i)"
                                placeholder="Hour" />
                            <Dropdown v-model="sb.schedule.minute" :options="[0, 5, 10, 15, 20, 30, 45]"
                                placeholder="Minute" />

                            <Dropdown v-model="sb.schedule.timezone"
                                :options="['America/Chicago', 'America/New_York', 'America/Denver', 'America/Los_Angeles', 'UTC']"
                                placeholder="Timezone" />
                            <Button :loading="sb.saving" label="Save schedule" icon="pi pi-save"
                                @click="saveSchedule" />
                        </div>
                        <small class="block mt-2 text-color-secondary">
                            Default: Sun/Mon/Thu/Sat at 00:00 in America/Chicago. Server applies cron.
                        </small>
                    </div>
                </template>
            </Card>
        </div>
    </AppLayout>
</template>



<style scoped>
/* optional tweaks */
.min-w-64 {
    min-width: 16rem;
}
</style>
