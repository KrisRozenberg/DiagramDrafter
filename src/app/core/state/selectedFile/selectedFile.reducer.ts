import { createReducer, on } from "@ngrx/store";
import { selectFile } from "./selectFile.actions";
import { SelectedFileState } from "../state.model";

export const initialSelectedFileState: SelectedFileState = {
    selectedFile: null
};

export const selectedFileReducer = createReducer(
    initialSelectedFileState,
    on(selectFile, (state, { dataFile }) => ({ selectedFile: dataFile }))
);