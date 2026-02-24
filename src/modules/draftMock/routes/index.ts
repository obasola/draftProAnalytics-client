// ============================================
// File: src/modules/mockDraft/routes/index.ts
// ============================================

import { RouteRecordRaw } from 'vue-router';
import { requireAuth } from '@/modules/auth/authGuard';

export const mockDraftRoutes: RouteRecordRaw[] = [
  {
    path: 'draft-mock',
    name: 'draftMockSimulator',
    component: () => import('../view/MockDraftSimulator.vue'),
    beforeEnter: requireAuth,
    meta: {
      requiresAuth: true,
      perm: { domain: 'DRAFT_TOOLS', action: 'VIEW' },
      title: 'Draft Simulator',
      icon: 'pi-users'
    }
  }
];





// ============================================
// File: src/components/AppNavigation.vue (MENU ENTRY)
// ============================================

// Add this to your navigation items array in AppNavigation.vue
// Place it in the "Draft Tools" section alongside Draft Simulator

const navigationItems = [
  // ... existing items ...
  
  // Draft Tools Section
  {
    label: 'Draft Tools',
    icon: 'pi pi-box',
    items: [
      {
        label: 'Draft Simulator',
        icon: 'pi pi-play-circle',
        to: '/draft-simulator',
        visible: () => can('DRAFT_TOOLS', 'VIEW')
      },
      {
        label: 'Mock Draft',  // <-- ADD THIS ENTRY
        icon: 'pi pi-users',
        to: '/mock-draft',
        visible: () => can('DRAFT_TOOLS', 'VIEW')
      },
      {
        label: 'Draft Board',
        icon: 'pi pi-th-large',
        to: '/draft-board',
        visible: () => can('DRAFT_TOOLS', 'VIEW')
      },
      {
        label: 'Draft Order',
        icon: 'pi pi-list',
        to: '/draft-order',
        visible: () => can('DRAFT_ORDER', 'VIEW')
      },
      {
        label: 'Draft Analysis',
        icon: 'pi pi-chart-line',
        to: '/draft-analysis',
        visible: () => can('DRAFT_TOOLS', 'VIEW')
      }
    ]
  },
  
  // ... rest of navigation items ...
];

