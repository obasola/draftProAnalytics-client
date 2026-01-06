import type { RouteRecordRaw } from "vue-router"
import { requireAuth } from "@/modules/auth/authGuard"

export const draftOrderRoutes: RouteRecordRaw[] = [
  {
    path: "draft-order",
    name: "DraftOrderSnapshots",
    component: () => import("@/modules/draftOrder/presentation/views/DraftOrderSnapshotsView.vue"),
    beforeEnter: requireAuth,
    meta: { requiresAuth: true, title: "Draft Order" },
  },
  {
    path: "draft-order/snapshots/:id",
    name: "DraftOrderSnapshotDetail",
    component: () => import("@/modules/draftOrder/presentation/views/DraftOrderSnapshotDetailView.vue"),
    beforeEnter: requireAuth,
    meta: { requiresAuth: true, title: "Draft Order Snapshot" },
  },
]
