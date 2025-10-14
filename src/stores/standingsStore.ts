// src/stores/standingsStore.ts
import { defineStore } from 'pinia';
import { fetchStandings } from '../services/standingsService';
import { TeamStandingDto } from '@/types/TeamStandingDto';


export const useStandingsStore = defineStore('standings', {
  state: () => ({
    standings: [] as TeamStandingDto[],
    loading: false,
  }),
  actions: {
    async load(year: number, seasonType: number) {
      this.loading = true;
      try {
        const data = await fetchStandings(year, seasonType);
        console.log("Fetched data Team: "+data[0].teamName);
        this.standings = Array.isArray(data) ? data : []; // ✅ ensure array
        console.log("Fetched array Team: "+this.standings[0].teamName);
      } catch (error) {
        console.error('Failed to load standings:', error);
        this.standings = [];
      } finally {
        this.loading = false;
      }
    },
  },
});
