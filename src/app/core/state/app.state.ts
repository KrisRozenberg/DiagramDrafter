import { DataFilesState, DataFiltersState, SelectedFileState } from "./state.model";

export interface AppState {
    dataFiles: DataFilesState;
    selectedFile: SelectedFileState;
    dataFilters: DataFiltersState;
}