// src/stores/standingsStore.ts
import { defineStore } from 'pinia';
import { fetchStandings } from '../services/standingsService';
import StandingsServices  from '../services/teamStandingsService'
import { TeamStandingDto } from '@/types/TeamStandingDto';

const service = new StandingsServices();
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
    async fetchStandings(year: number, seasonType = 2) {
      this.loading = true;
      const res = await service.getAll(year, seasonType);
      this.standings = res.data; 
      this.loading = false;
    },
  },
});
