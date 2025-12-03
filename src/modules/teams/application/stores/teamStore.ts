// src/modules/teams/application/stores/teamStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Team } from '@/types/index.ts' // your domain entity
 
import {teamService} from '@/services/teamService'

import type { TeamLogoInfo, TeamRef } from "@/util/teamLogo";
import { getTeamLogoInfo } from "@/util/teamLogo";

export const useTeamStore = defineStore("teams", () => {
  const teamsById = ref<Map<number, Team>>(new Map());
  const logoById = ref<Map<number, TeamLogoInfo>>(new Map());

  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const initialized = ref<boolean>(false);

  const allTeams = computed<Team[]>(() => Array.from(teamsById.value.values()));

  function buildMaps(data: Team[]): void {
    const teamsMap = new Map<number, Team>();
    const logosMap = new Map<number, TeamLogoInfo>();

    for (const team of data) {
      // 💡 Narrow the ID so it's guaranteed number inside this block
      const key = team.id; // if your PK is team.teamId, change this line
      if (typeof key !== "number") {
        // In strict world, treat missing id as a data error, not a typing hack
        console.warn("Skipping team without numeric id:", team);
        continue;
      }

      teamsMap.set(key, team);

      const ref: TeamRef = {
        name: team.name,
        conference: team.conference,
      };
      const logoInfo = getTeamLogoInfo(ref);

      logosMap.set(key, logoInfo);
    }

    teamsById.value = teamsMap;
    logoById.value = logosMap;
  }

  async function fetchAllTeams(): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const data: Team[] = await teamService.getAllTeams();
      buildMaps(data);
      initialized.value = true;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load teams";
      error.value = message;
    } finally {
      loading.value = false;
    }
  }

  async function ensureLoaded(): Promise<void> {
    if (!initialized.value && !loading.value) {
      await fetchAllTeams();
    }
  }

  function getTeamById(id: number | null | undefined): Team | null {
    if (id == null) return null;
    return teamsById.value.get(id) ?? null;
  }

  function getLogoInfoById(id: number | null | undefined): TeamLogoInfo | null {
    if (id == null) return null;
    return logoById.value.get(id) ?? null;
  }

  function getDisplayNameById(id: number | null | undefined): string {
    if (id == null) return "TBD";

    const logoInfo = logoById.value.get(id);
    if (logoInfo?.shortName) {
      return logoInfo.shortName;
    }

    const team = teamsById.value.get(id);
    return team?.name ?? "TBD";
  }

  return {
    // state
    teamsById,
    logoById,
    loading,
    error,
    initialized,

    // getters
    allTeams,
    getTeamById,
    getLogoInfoById,
    getDisplayNameById,

    // actions
    fetchAllTeams,
    ensureLoaded,
  };
});
