/**
 * Map Tab Components - Centralized exports for all tab components
 */

// Simple tab wrappers
export { MapTab } from "./MapTab"
export type { MapTabProps } from "./MapTab"

export { default as BudgetTab } from "./BudgetTab"
export type { BudgetTabProps } from "./BudgetTab"

export { InfoTab } from "./InfoTab"

export { CommentsTab } from "./CommentsTab"

// AddUnitTab - Complex tab that needs further refactoring
// TODO: Extract AddUnitTab (1,200+ lines)
// Will be split into:
// - AddUnitTab/index.tsx (orchestrator)
// - AddUnitTab/AddUnitMap.tsx (map section with crosshair)
// - AddUnitTab/AddUnitForm.tsx (form fields)
