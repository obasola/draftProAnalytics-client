// stores/theme.store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Team, TeamId } from '@/types/team.types';
import { TeamRepository } from '@/infrastructure/repositories/team.repository';
import { ThemeService } from '@/application/services/theme.service';

export const useThemeStore = defineStore('theme', () => {
  // State
  const teams = ref<Team[]>([]);
  const currentTeam = ref<Team | null>(null);
  const isLoading = ref(false);

  // Lazy initialization of dependencies
  let teamRepository: TeamRepository | null = null;
  let themeService: ThemeService | null = null;

  const getTeamRepository = (): TeamRepository => {
    if (!teamRepository) {
      teamRepository = new TeamRepository();
    }
    return teamRepository;
  };

  const getThemeService = (): ThemeService => {
    if (!themeService) {
      themeService = new ThemeService(getTeamRepository());
    }
    return themeService;
  };

  // Getters
  const teamsByConference = computed(() => {
    const afc = teams.value.filter(team => team.conference === 'AFC');
    const nfc = teams.value.filter(team => team.conference === 'NFC');
    return { afc, nfc };
  });

  const teamsByDivision = computed(() => {
    return teams.value.reduce((acc, team) => {
      if (!acc[team.division]) {
        acc[team.division] = [];
      }
      acc[team.division].push(team);
      return acc;
    }, {} as Record<string, Team[]>);
  });

  // Actions
  const loadTeams = async (): Promise<void> => {
    isLoading.value = true;
    try {
      teams.value = await getTeamRepository().getAll();
    } catch (error) {
      console.error('Failed to load teams:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const selectTeam = async (teamId: TeamId): Promise<void> => {
    try {
      await getThemeService().applyTeamColors(teamId);
      currentTeam.value = getThemeService().getCurrentTeam();
    } catch (error) {
      console.error('Failed to select team:', error);
      throw error;
    }
  };

  const resetTheme = (): void => {
    getThemeService().resetToDefault();
    currentTeam.value = null;
  };

  const initializeTheme = async (): Promise<void> => {
    await loadTeams();
    await getThemeService().loadSavedTeam();
    currentTeam.value = getThemeService().getCurrentTeam();
  };

  return {
    // State
    teams,
    currentTeam,
    isLoading,
    
    // Getters
    teamsByConference,
    teamsByDivision,
    
    // Actions
    loadTeams,
    selectTeam,
    resetTheme,
    initializeTheme,
  };
});