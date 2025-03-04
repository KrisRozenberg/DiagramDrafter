import { createSelector } from "@ngrx/store";
import { AppState } from "../app.state";
import { DataFiltersState } from "../state.model";

export const hideNeglectableFilter: any = createSelector(
    (state: AppState) => state.dataFilters,
    (state: DataFiltersState) => state.hideNeglectable
);

export const categorySortValue: any = createSelector(
    (state: AppState) => state.dataFilters,
    (state: DataFiltersState) => state.categorySort
);

export const selectDataFiltersState: any = createSelector(
    (state: AppState) => state.dataFilters,
    (state: DataFiltersState) => state
);