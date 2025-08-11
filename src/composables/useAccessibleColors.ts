// composables/useAccessibleColors.ts
import { computed } from 'vue';
import { useTeamColors } from './useTeamColors';
import { ColorUtils } from '@/util/color.util';

export const useAccessibleColors = () => {
  const { teamColors } = useTeamColors();

  const accessibleColors = computed(() => {
    const { primary, secondary, accent } = teamColors.value;

    return {
      primary: {
        background: primary,
        text: ColorUtils.getBestContrastColor(primary),
        meetsWCAGAA: ColorUtils.meetsWCAGAA(ColorUtils.getBestContrastColor(primary), primary),
      },
      secondary: {
        background: secondary,
        text: ColorUtils.getBestContrastColor(secondary),
        meetsWCAGAA: ColorUtils.meetsWCAGAA(ColorUtils.getBestContrastColor(secondary), secondary),
      },
      accent: {
        background: accent,
        text: ColorUtils.getBestContrastColor(accent),
        meetsWCAGAA: ColorUtils.meetsWCAGAA(ColorUtils.getBestContrastColor(accent), accent),
      },
    };
  });

  const getAccessibleTextColor = (backgroundColor: string): string => {
    return ColorUtils.getBestContrastColor(backgroundColor);
  };

  const validateColorCombination = (foreground: string, background: string) => {
    return {
      contrastRatio: ColorUtils.getContrastRatio(foreground, background),
      meetsWCAGAA: ColorUtils.meetsWCAGAA(foreground, background),
      meetsWCAGAAA: ColorUtils.meetsWCAGAAA(foreground, background),
    };
  };

  return {
    accessibleColors,
    getAccessibleTextColor,
    validateColorCombination,
  };
};
