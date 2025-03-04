import { createAction, props } from "@ngrx/store";
import { UploadedFile } from "../../models/data.model";

export const initialDataFilesFilling = createAction(
    '[Data Service] Read Saved Files',
    props<{ dataFiles: UploadedFile[] }>()
);

export const uploadFile = createAction(
    '[Dashboard Page] Upload File',
    props<{ file: File }>()
);

export const uploadFileSuccess = createAction(
    '[Data Files Effects] Upload File Success',
    props<{ fileUploaded: UploadedFile }>()
);

export const uploadFileFailure = createAction(
    '[Data Files Effects] Upload File Failure',
    props<{ error: string }>()
);