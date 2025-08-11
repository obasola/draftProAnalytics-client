// composables/useTeamColors.ts
import { computed, readonly } from 'vue';
import { storeToRefs } from 'pinia';
import { useThemeStore } from '@/stores/theme.store';
import { ColorUtils } from '@/util/color.util';

export const useTeamColors = () => {
  const themeStore = useThemeStore();
  const { currentTeam } = storeToRefs(themeStore);

  const teamColors = computed(() => {
    if (!currentTeam.value) {
      return {
        primary: '#013369',
        secondary: '#D50A0A',
        accent: '#FFFFFF',
      };
    }
    return currentTeam.value.colors;
  });

  const getCSSVariable = (colorName: 'primary' | 'secondary' | 'accent') => {
    return `var(--team-${colorName})`;
  };

  const getContrastColor = (backgroundColor: string): string => {
    // Always use the utility function since Team interface has no methods
    return ColorUtils.getBestContrastColor(backgroundColor);
  };

  const applyColorsToElement = (element: HTMLElement): void => {
    // Manually apply colors since Team interface has no methods
    if (currentTeam.value) {
      const root = document.documentElement;
      root.style.setProperty('--team-primary', currentTeam.value.colors.primary);
      root.style.setProperty('--team-secondary', currentTeam.value.colors.secondary);
      root.style.setProperty('--team-accent', currentTeam.value.colors.accent);
      
      // Also set RGB versions for transparency
      const primaryRgb = ColorUtils.hexToRgb(currentTeam.value.colors.primary);
      const secondaryRgb = ColorUtils.hexToRgb(currentTeam.value.colors.secondary);
      const accentRgb = ColorUtils.hexToRgb(currentTeam.value.colors.accent);
      
      if (primaryRgb) {
        root.style.setProperty('--team-primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);
      }
      if (secondaryRgb) {
        root.style.setProperty('--team-secondary-rgb', `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}`);
      }
      if (accentRgb) {
        root.style.setProperty('--team-accent-rgb', `${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}`);
      }
    }
  };

  return {
    teamColors,
    currentTeam: readonly(currentTeam),
    getCSSVariable,
    getContrastColor,
    applyColorsToElement,
  };
};