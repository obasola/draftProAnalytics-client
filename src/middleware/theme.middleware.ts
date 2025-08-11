// middleware/theme.middleware.ts
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router';
import { useThemeStore } from '@/stores/theme.store';

export const themeMiddleware = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
): Promise<void> => {
  const themeStore = useThemeStore();
  
  // Initialize theme if not already done
  if (themeStore.teams.length === 0) {
    await themeStore.initializeTheme();
  }

  // Check if route has team parameter and apply colors
  if (to.params.teamId && typeof to.params.teamId === 'string') {
    try {
      await themeStore.selectTeam(to.params.teamId);
    } catch (error) {
      console.warn(`Invalid team ID in route: ${to.params.teamId}`);
    }
  }

  next();
};
