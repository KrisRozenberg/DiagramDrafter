import { createSelector } from "@ngrx/store";
import { AppState } from "../app.state";
import { SelectedFileState } from "../state.model";

export const selectSelectedFile: any = createSelector(
    (state: AppState) => state.selectedFile,
    (state: SelectedFileState) => state.selectedFile
);