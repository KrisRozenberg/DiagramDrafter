import { createSelector } from "@ngrx/store";
import { AppState } from "../app.state";
import { DataFilesState } from "../state.model";

export const selectDataFiles: any = createSelector(
    (state: AppState) => state.dataFiles,
    (state: DataFilesState) => state.dataFiles
);

export const selectUploadFileStatus: any = createSelector(
    (state: AppState) => state.dataFiles,
    (state: DataFilesState) => state.status
);

export const selectUploadFileError: any = createSelector(
    (state: AppState) => state.dataFiles,
    (state: DataFilesState) => state.error
);