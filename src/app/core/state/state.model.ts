import { RequestStatusEnum, SortOptionsEnum } from "../helpers/constants";
import { UploadedFile } from "../models/data.model";

export interface DataFilesState {
    dataFiles: UploadedFile[];
    error: string;
    status: RequestStatusEnum;
};

export interface SelectedFileState {
    selectedFile: UploadedFile | null;
};

export interface DataFiltersState {
    hideNeglectable: boolean;
    categorySort: SortOptionsEnum;
};