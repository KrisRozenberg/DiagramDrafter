import { SortOptionsEnum } from "../helpers/constants";

export interface InputData {
    category: string;
    value: number;
}

export interface UploadedFile {
    id: number;
    name: string;
    uploadDate: Date;
    data: InputData[];
}

export interface DataFilters {
    hideNeglectable: boolean;
    categorySort: SortOptionsEnum;
}