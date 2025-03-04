import { Injectable } from '@angular/core';
import { InputData, UploadedFile } from '../models/data.model';
import { forkJoin, map, Observable, Subscriber } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { initialDataFilesFilling } from '../state/dataFiles/dataFiles.actions';
import { selectFile } from '../state/selectedFile/selectFile.actions';
import { ConstsHelper } from '../helpers/constants';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private _lastDataFileId = 0;
  private _fileReader = new FileReader();

  constructor(
    private _http: HttpClient,
    private _store: Store
  ) {}

  readSavedFiles() {
    let initialDataFiles: UploadedFile[] = [];

    // upload history files if exist
    if (ConstsHelper.historyFiles) {
      this._lastDataFileId = ConstsHelper.historyFiles[0].id;
      initialDataFiles = ConstsHelper.historyFiles;
      this.saveInitialFiles(initialDataFiles);
    }
    // if doesn't - read local files to show some example data
    else {
      forkJoin({
        file1: this.readFromLocalFile('example_1'),
        file2: this.readFromLocalFile('example_2')
      }).subscribe((res) => {
        const localDataFiles: UploadedFile[] = [
          {
            id: ++this._lastDataFileId,
            name: 'example_1',
            uploadDate: new Date('4/29/1997'),
            data: res.file1
          } as UploadedFile,
          {
            id: ++this._lastDataFileId,
            name: 'example_2',
            uploadDate: new Date('9/4/2022'),
            data: res.file2
          } as UploadedFile
        ].sort((el1, el2) => el2.uploadDate.getTime() - el1.uploadDate.getTime());
        
        initialDataFiles = localDataFiles;
        this.saveInitialFiles(initialDataFiles);
      })
    }
  }

  readFromLocalFile(fileName: string): Observable<InputData[]> {
    return this._http
      .get<InputData[]>(`files/${fileName}.json`)
      .pipe(
        map((data: InputData[]) => {
          if (this.isFileContentInvalid(data)) {
            console.error('Local file provides invalid data');
            throw new Error("Local file provides invalid data");
          }
    
          return data.map(el => (
            {
              category: el.category,
              value: el.value
            } as InputData
          ));
        })
      );
  }

  saveInitialFiles(initialDataFiles: UploadedFile[]) {
    this._store.dispatch(initialDataFilesFilling({ dataFiles: initialDataFiles }));
    this._store.dispatch(selectFile({ dataFile: initialDataFiles[0] }));
  }

  uploadFile(file: File) {
    return new Observable((observer: Subscriber<UploadedFile>): void => {
      this._fileReader.readAsText(file, "UTF-8");

      this._fileReader.onload = () => {
        if (typeof this._fileReader.result === 'string') {
          try {
            const fileContent = JSON.parse(this._fileReader.result);
        
            if (this.isFileContentInvalid(fileContent)) {
              console.error('File data is invalid');
              observer.error('File data is invalid');
              return;
            }
          
            const data = fileContent.map((el: InputData) => (
              {
                category: el.category,
                value: el.value
              } as InputData
            ));
        
            const fileToSave = {
              id: ++this._lastDataFileId,
              name: file.name.slice(0,-5),
              uploadDate: new Date(),
              data: data
            } as UploadedFile;

            observer.next(fileToSave);
            observer.complete();
          }
          catch (error) {
            console.error('Parse error');
            observer.error('File data is invalid');
          }
        }
        else {
          console.error('Reading result is not string');
          observer.error('File data is invalid');
        }
      }
        
      this._fileReader.onerror = () => {
        console.error('File loading failed');
        observer.error('File loading failed');
      }
    });
  }

  // ensures data objects to have required properties with required values
  isFileContentInvalid(data: InputData[]) {
    return data.find((el: InputData) => (
      !(typeof el.category === 'string' && el.category !== '') || 
      (!(typeof el.value === 'number')  || el.value < 0)
    ));
  }

  saveHistory(files: UploadedFile[]) {
    localStorage.setItem('historyFiles', JSON.stringify(files));
  }

  private static _initialize = (() => {
    const historyFilesInfo = localStorage.getItem('historyFiles');      
    if (historyFilesInfo) ConstsHelper.historyFiles = JSON.parse(historyFilesInfo);
  })();
}
