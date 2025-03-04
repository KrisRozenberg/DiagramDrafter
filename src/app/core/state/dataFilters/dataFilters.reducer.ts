import { createReducer, on } from "@ngrx/store";
import { categorySort, hideNeglectable } from "./dataFilters.actions";
import { DataFiltersState } from "../state.model";
import { SortOptionsEnum } from "../../helpers/constants";

export const initialDataFiltersState: DataFiltersState = {
    hideNeglectable: false,
    categorySort: SortOptionsEnum.DEFAULT
};

export const dataFiltersReducer = createReducer(
    initialDataFiltersState,
    on(hideNeglectable, (state, { hide }) => ({ ...state, hideNeglectable: hide })),
    on(categorySort, (state, { sort }) => ({ ...state, categorySort: sort }))
);