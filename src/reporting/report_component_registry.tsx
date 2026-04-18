import type { ReportPageId } from './report_scene_schema'
import { REPORT_PAGE_RECIPES } from './report_page_recipes'

export type ReportPageComponent = () => null

const NullPageComponent: ReportPageComponent = () => null

export const REPORT_COMPONENT_REGISTRY: Record<
  ReportPageId,
  {
    pageId: ReportPageId
    component: ReportPageComponent
    renderUnit: 'page'
    internalZoneRouting: boolean
    recipeTitle: string
  }
> = {
  P1: { pageId: 'P1', component: NullPageComponent, renderUnit: 'page', internalZoneRouting: false, recipeTitle: REPORT_PAGE_RECIPES.P1.title },
  P2: { pageId: 'P2', component: NullPageComponent, renderUnit: 'page', internalZoneRouting: false, recipeTitle: REPORT_PAGE_RECIPES.P2.title },
  P3: { pageId: 'P3', component: NullPageComponent, renderUnit: 'page', internalZoneRouting: false, recipeTitle: REPORT_PAGE_RECIPES.P3.title },
  P4: { pageId: 'P4', component: NullPageComponent, renderUnit: 'page', internalZoneRouting: true, recipeTitle: REPORT_PAGE_RECIPES.P4.title },
  P5: { pageId: 'P5', component: NullPageComponent, renderUnit: 'page', internalZoneRouting: false, recipeTitle: REPORT_PAGE_RECIPES.P5.title },
  P6: { pageId: 'P6', component: NullPageComponent, renderUnit: 'page', internalZoneRouting: false, recipeTitle: REPORT_PAGE_RECIPES.P6.title },
  A1: { pageId: 'A1', component: NullPageComponent, renderUnit: 'page', internalZoneRouting: false, recipeTitle: REPORT_PAGE_RECIPES.A1.title },
  B1: { pageId: 'B1', component: NullPageComponent, renderUnit: 'page', internalZoneRouting: false, recipeTitle: REPORT_PAGE_RECIPES.B1.title }
}
