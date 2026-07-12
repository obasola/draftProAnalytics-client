<script setup lang="ts">
import { computed } from 'vue'
import TabPanel from 'primevue/tabpanel'
import TabView from 'primevue/tabview'
import DraftPickCardList from './DraftPickCardList.vue'
import type { DraftPickDto } from '../types/draftDayScorecard.types'

const props = defineProps<{
  picks: DraftPickDto[]
  editable?: boolean
}>()

const emit = defineEmits<{
  edit: [pick: DraftPickDto]
  onClock: [pick: DraftPickDto]
  complete: [pick: DraftPickDto]
}>()

interface RoundTab {
  round: number | null
  label: string
  picks: DraftPickDto[]
}

const sortedPicks = computed<DraftPickDto[]>(() => {
  return [...props.picks].sort((a, b) => {
    const aOverall = a.overallPick ?? a.pickNumber
    const bOverall = b.overallPick ?? b.pickNumber
    return a.round - b.round || aOverall - bOverall
  })
})

const roundTabs = computed<RoundTab[]>(() => {
  const tabs: RoundTab[] = [
    {
      round: null,
      label: `All (${sortedPicks.value.length})`,
      picks: sortedPicks.value,
    },
  ]

  for (let round = 1; round <= 7; round += 1) {
    const roundPicks = sortedPicks.value.filter((pick) => pick.round === round)
    tabs.push({
      round,
      label: `R${round} (${roundPicks.length})`,
      picks: roundPicks,
    })
  }

  return tabs
})

function emptyMessage(tab: RoundTab): string {
  if (tab.round === null) return 'No picks found for this team.'
  return `No Round ${tab.round} picks for this team.`
}
</script>

<template>
  <TabView>
    <TabPanel v-for="tab in roundTabs" :key="tab.label" :header="tab.label">
      <DraftPickCardList
        :picks="tab.picks"
        :empty-message="emptyMessage(tab)"
        :editable="props.editable"
        @edit="emit('edit', $event)"
        @on-clock="emit('onClock', $event)"
        @complete="emit('complete', $event)"
      />
    </TabPanel>
  </TabView>
</template>
