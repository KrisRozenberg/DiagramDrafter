import { createReducer, on } from "@ngrx/store";
import { initialDataFilesFilling, uploadFile, uploadFileFailure, uploadFileSuccess } from "./dataFiles.actions";
import { DataFilesState } from "../state.model";
import { RequestStatusEnum } from "../../helpers/constants";

export const initialDataFilesState: DataFilesState = {
    dataFiles: [],
    error: '',
    status: RequestStatusEnum.PENDING
};

export const dataFilesReducer = createReducer(
    initialDataFilesState,
    on(initialDataFilesFilling, (state, { dataFiles }) => ({
        ...state, 
        dataFiles: dataFiles, 
        status: RequestStatusEnum.SUCCESS
    })),
    on(uploadFile, (state) => ({...state, status: RequestStatusEnum.LOADING})),
    on(uploadFileSuccess, (state, { fileUploaded }) => ({
        dataFiles: [fileUploaded].concat(state.dataFiles), 
        error: '',
        status: RequestStatusEnum.SUCCESS
    })),
    on(uploadFileFailure, (state, { error }) => ({
        ...state, 
        error: error, 
        status: RequestStatusEnum.ERROR
    }))
);