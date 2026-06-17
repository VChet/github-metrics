import type { RouteNamedMap } from "vue-router/auto-routes";

export interface Tab {
  value: keyof RouteNamedMap
  text: string
}
