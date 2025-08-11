// plugins/team-colors.plugin.ts
import type { App } from 'vue';
import { useThemeStore } from '@/stores/theme.store';

export interface TeamColorsPlugin {
  install(app: App): void;
}

export const TeamColorsPlugin: TeamColorsPlugin = {
  install(app: App) {
    // Global property for accessing team colors
    app.config.globalProperties.$teamColors = {
      getCurrent: () => {
        const themeStore = useThemeStore();
        return themeStore.currentTeam?.colors || {
          primary: '#013369',
          secondary: '#D50A0A',
          accent: '#FFFFFF',
        };
      },
      
      applyTeam: async (teamId: string) => {
        const themeStore = useThemeStore();
        await themeStore.selectTeam(teamId);
      },
      
      reset: () => {
        const themeStore = useThemeStore();
        themeStore.resetTheme();
      }
    };

    // Global directive for auto-applying team colors
    app.directive('team-color', {
      mounted(el: HTMLElement, binding) {
        const { value, arg = 'background' } = binding;
        const themeStore = useThemeStore();
        
        const applyColor = () => {
          const team = themeStore.currentTeam;
          if (team && value in team.colors) {
            const color = team.colors[value as keyof typeof team.colors];
            if (arg === 'background') {
              el.style.backgroundColor = color;
            } else if (arg === 'color') {
              el.style.color = color;
            } else if (arg === 'border') {
              el.style.borderColor = color;
            }
          }
        };

        // Apply initial color
        applyColor();

        // Watch for team changes
        const unwatch = watch(
          () => themeStore.currentTeam,
          applyColor,
          { immediate: true }
        );

        // Store cleanup function
        (el as any)._teamColorCleanup = unwatch;
      },
      
      unmounted(el: HTMLElement) {
        if ((el as any)._teamColorCleanup) {
          (el as any)._teamColorCleanup();
        }
      }
    });
  }
};


