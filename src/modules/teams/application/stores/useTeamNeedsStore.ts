import { defineStore } from "pinia";
import { TeamNeedDto, TeamNeedsPageDto, TeamNeedSuggestionDto } from "../../domain/dtos/TeamNeedDtos";
import { buildTeamNeedsApi } from "../../infrastructure/TeamNeedsApi";
import { LoadTeamNeedsPageUseCase } from "../usecases/LoadTeamNeedsPageUseCase";
import { UpsertTeamNeedUseCase } from "../usecases/UpsertTeamNeedUseCase";
import { DeleteTeamNeedUseCase } from "../usecases/DeleteTeamNeedUseCase";

export interface TeamNeedsState {
  isLoading: boolean;
  error: string | null;
  teamId: number | null;
  evaluationYear: number | null;
  persistedNeeds: TeamNeedDto[];
  suggestions: TeamNeedSuggestionDto[];
}

export const useTeamNeedsStore = defineStore("teamNeeds", {
  state: (): TeamNeedsState => ({
    isLoading: false,
    error: null,
    teamId: null,
    evaluationYear: null,
    persistedNeeds: [],
    suggestions: []
  }),

  actions: {
    async load(teamId: number): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const api = buildTeamNeedsApi();
        const uc = new LoadTeamNeedsPageUseCase(api);

        const page: TeamNeedsPageDto = await uc.execute(teamId);
        this.teamId = page.teamId;
        this.evaluationYear = page.evaluationYear;
        this.persistedNeeds = page.persistedNeeds;
        this.suggestions = page.suggestions;
      } catch (e: unknown) {
        this.error = e instanceof Error ? e.message : "Failed to load team needs.";
      } finally {
        this.isLoading = false;
      }
    },

    async applySuggestion(teamId: number, suggestion: TeamNeedSuggestionDto): Promise<void> {
      const api = buildTeamNeedsApi();
      const uc = new UpsertTeamNeedUseCase(api);

      const saved = await uc.execute(teamId, {
        position: suggestion.position,
        priority: suggestion.priority,
        draftYear: suggestion.draftYear
      });

      // update local state
      const idx = this.persistedNeeds.findIndex((n) => n.position === saved.position);
      if (idx >= 0) this.persistedNeeds.splice(idx, 1, saved);
      else this.persistedNeeds.push(saved);

      this.persistedNeeds.sort((a, b) => b.priority - a.priority || a.position.localeCompare(b.position));
    },

    async saveNeed(teamId: number, need: { position: string; priority: number; draftYear: number | null }): Promise<void> {
      const api = buildTeamNeedsApi();
      const uc = new UpsertTeamNeedUseCase(api);

      const saved = await uc.execute(teamId, need);

      const idx = this.persistedNeeds.findIndex((n) => n.position === saved.position);
      if (idx >= 0) this.persistedNeeds.splice(idx, 1, saved);
      else this.persistedNeeds.push(saved);

      this.persistedNeeds.sort((a, b) => b.priority - a.priority || a.position.localeCompare(b.position));
    },

    async deleteNeed(teamId: number, position: string): Promise<void> {
      const api = buildTeamNeedsApi();
      const uc = new DeleteTeamNeedUseCase(api);

      await uc.execute(teamId, position);
      this.persistedNeeds = this.persistedNeeds.filter((n) => n.position !== position);
    }
  }
});

