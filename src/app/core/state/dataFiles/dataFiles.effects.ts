import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { DataService } from "../../services/data.service";
import { catchError, map, of, switchMap } from "rxjs";
import { uploadFile, uploadFileFailure, uploadFileSuccess } from "./dataFiles.actions";

@Injectable()
export class DataFilesEffects {
    constructor(
        private _actions$: Actions,
        private _dataService: DataService
    ) {}

    uploadFile$ = createEffect(() => 
        this._actions$.pipe(
            ofType(uploadFile),
            switchMap((action) => 
                this._dataService.uploadFile(action.file).pipe(
                    map(uploadedFile => (uploadFileSuccess({ fileUploaded: uploadedFile}))),
                    catchError(error => of(uploadFileFailure({error})))
                )
            )
        )
    );
}