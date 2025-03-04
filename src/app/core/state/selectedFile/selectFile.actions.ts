import { createAction, props } from "@ngrx/store";
import { UploadedFile } from "../../models/data.model";

export const selectFile = createAction(
    '[Dashboard Page | Data Service] Select File',
    props<{ dataFile: UploadedFile }>()
);