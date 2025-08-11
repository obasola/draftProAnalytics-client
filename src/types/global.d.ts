// types/global.d.ts
import type { TeamColors } from './team.types';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $teamColors: {
      getCurrent(): TeamColors;
      applyTeam(teamId: string): Promise<void>;
      reset(): void;
    };
  }
}