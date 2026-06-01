<script setup lang="ts">
import { useRouter } from 'vue-router';
import TabPanel from 'primevue/tabpanel';
import TabView from 'primevue/tabview';
import JobList from '../components/JobList.vue';
import JobQueueDialog from '../components/JobQueueDialog.vue';
import JobSchedulePanel from '../components/JobSchedulePanel.vue';
import LoadSeasonSchedulePanel from '../components/LoadSeasonSchedulePanel.vue';

const router = useRouter();

const viewJob = (jobId: number): void => {
  alert("JobsPage::Show JobDetails view")
  router.push({ name: 'JobDetail', params: { id: jobId } });
};
</script>

<template>
  <section class="jobs-page">
    <div class="page-header">
      <div>
        <h2>Jobs</h2>
        <p>Queue, run, monitor, and schedule DPA background jobs.</p>
      </div>

      <JobQueueDialog />
    </div>

    <TabView>
      <TabPanel header="Queue">
        <JobList @view-job="viewJob" />
      </TabPanel>

      <TabPanel header="Load Season Schedule">
        <LoadSeasonSchedulePanel />
      </TabPanel>

      <TabPanel header="Schedules">
        <JobSchedulePanel />
      </TabPanel>
    </TabView>
  </section>
</template>

<style scoped>
.jobs-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.page-header h2,
.page-header p {
  margin: 0;
}

@media (max-width: 700px) {
  .page-header {
    flex-direction: column;
  }
}
</style>
