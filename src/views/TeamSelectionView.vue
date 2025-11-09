<template>
  
    <div class="team-selection-container">
      <div class="content-grid">
        <!-- Team Selection Section -->
        <div class="teams-section">
          <div class="section-header">
            <h2>Draft selection for NFL Teams</h2>
            <div class="selection-summary">
              <span class="selected-count">{{ selectedTeams.length }} teams selected</span>
              <button 
                v-if="selectedTeams.length > 0" 
                @click="clearSelection"
                class="btn btn-outline-secondary btn-sm"
              >
                Clear All
              </button>
            </div>
          </div>

          <!-- PrimeVue Conference Tabs -->
          <TabView v-model:activeIndex="activeTabIndex" class="conference-tabs">
            <TabPanel 
              v-for="(conference, index) in conferences" 
              :key="conference.abbreviation"
            >
              <template #header>
                <div class="tab-header">
                  <div class="tab-logo">
                    <img 
                      v-if="conference.logoUrl"
                      :src="conference.logoUrl" 
                      :alt="`${conference.abbreviation} logo`"
                      class="tab-logo-img"
                    />
                    <div v-else class="tab-logo-fallback">{{ conference.abbreviation }}</div>
                  </div>
                  <div class="tab-info">
                    <span class="tab-name">{{ conference.abbreviation }}</span>
                    <span class="tab-count">{{ getSelectedInConference(conference.abbreviation) }}/{{ conference.teams.length }}</span>
                  </div>
                </div>
              </template>

              <!-- Conference Content -->
              <div class="conference-content">
                <ConferenceSection
                  :conference="conference"
                  :selected-teams="selectedTeams"
                  :show-four-columns="true"
                  @toggle-team="toggleTeamSelection"
                />
              </div>
            </TabPanel>
          </TabView>
        </div>

        <!-- Settings Section -->
        <div class="settings-section">
          <DraftSettings
            v-model:current-round="currentRound"
            :selected-teams-count="selectedTeams.length"
            @submit="submitTeamSelection"
            @select-all="selectAllTeams"
            @select-conference="selectConference"
          />
        </div>
      </div>
    </div>
  
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import AppLayout from '@/components/ui/AppLayout.vue'
import ConferenceSection from '@/components/draftselection/ConferenceSection.vue'
import DraftSettings from '@/components/draftselection/DraftSettings.vue'
import { useTeamData } from '@/composables/useTeamData'
import type { Conference } from '@/types/Teams';

interface Props {
  conference: Conference
}

defineProps<Props>()

const router = useRouter()

// State
const selectedTeams = ref<string[]>([])
const currentRound = ref<number>(1)
const activeTabIndex = ref<number>(0)

// Use team data composable
const { conferences, getAllTeamCodes, getTeamsByConference } = useTeamData({ 
  enableLogos: true
})

// Computed
const getSelectedInConference = (conferenceAbbr: 'AFC' | 'NFC') => {
  const conferenceTeams = getTeamsByConference(conferenceAbbr)
  return conferenceTeams.filter(team => selectedTeams.value.includes(team.code)).length
}

// Methods
const toggleTeamSelection = (teamCode: string) => {
  const index = selectedTeams.value.indexOf(teamCode)
  if (index === -1) {
    selectedTeams.value.push(teamCode)
  } else {
    selectedTeams.value.splice(index, 1)
  }
}

const clearSelection = () => {
  selectedTeams.value = []
}

const selectAllTeams = () => {
  selectedTeams.value = getAllTeamCodes()
}

const selectConference = (conference: 'AFC' | 'NFC') => {
  const conferenceTeams = getTeamsByConference(conference)
  selectedTeams.value = conferenceTeams.map(team => team.code)
  // Switch to the selected conference tab
  const conferenceIndex = conferences.value.findIndex(c => c.abbreviation === conference)
  if (conferenceIndex !== -1) {
    activeTabIndex.value = conferenceIndex
  }
}

const submitTeamSelection = () => {
  if (selectedTeams.value.length === 0) {
    alert('Please select at least one team')
    return
  }

  // Save selection to localStorage for persistence
  localStorage.setItem('selectedTeams', JSON.stringify(selectedTeams.value))
  localStorage.setItem('currentRound', currentRound.value.toString())

  // Navigate to draft tracker
  router.push('/draft-tracker')
}
</script>

<style scoped>
.team-selection-container {
  padding: 0.3rem 2rem 2rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

.teams-section {
  background: #222;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #333;
}

.section-header h2 {
  color: #fff;
  margin: 0;
  font-size: 1.5rem;
}

.selection-summary {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.selected-count {
  color: #28a745;
  font-weight: 600;
}

/* PrimeVue Tab Customization */
.conference-tabs {
  margin-bottom: 1.5rem;
}

.tab-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
}

.tab-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
  overflow: hidden;
  background: #555;
}

.tab-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.tab-logo-fallback {
  color: white;
  font-weight: bold;
  font-size: 0.7rem;
}

.tab-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}

.tab-name {
  font-size: 1rem;
  font-weight: 600;
}

.tab-count {
  font-size: 0.8rem;
  opacity: 0.8;
}

.conference-content {
  min-height: 400px;
  padding-top: 1rem;
}

.settings-section {
  position: sticky;
  top: 2rem;
}

/* PrimeVue Tab Theme Overrides */
:deep(.p-tabview .p-tabview-nav) {
  background: transparent;
  border: none;
}

:deep(.p-tabview .p-tabview-nav li .p-tabview-nav-link) {
  background: #2a2a2a;
  border: 2px solid #333;
  border-radius: 8px;
  color: #aaa;
  margin-right: 0.5rem;
  padding: 1rem;
}

:deep(.p-tabview .p-tabview-nav li.p-highlight .p-tabview-nav-link) {
  background: #1a5d3a;
  border-color: #28a745;
  color: #fff;
  box-shadow: 0 0 0 1px rgba(40, 167, 69, 0.3);
}

:deep(.p-tabview .p-tabview-nav li .p-tabview-nav-link:not(.p-disabled):focus) {
  box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.5);
}

:deep(.p-tabview .p-tabview-nav li:not(.p-highlight):not(.p-disabled):hover .p-tabview-nav-link) {
  background: #333;
  border-color: #444;
}

:deep(.p-tabview .p-tabview-panels) {
  background: transparent;
  padding: 0;
  border: none;
}
</style>