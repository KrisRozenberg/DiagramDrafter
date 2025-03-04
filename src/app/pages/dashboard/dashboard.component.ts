import { Component, OnDestroy, OnInit } from '@angular/core';
import { UploadedFile } from '../../core/models/data.model';
import { BarChartComponent } from "./bar-chart/bar-chart.component";
import { PieChartComponent } from "./pie-chart/pie-chart.component";
import { DataService } from '../../core/services/data.service';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, take, takeUntil } from 'rxjs';
import { selectDataFiles, selectUploadFileError, selectUploadFileStatus } from '../../core/state/dataFiles/dataFiles.selectors';
import { selectFile } from '../../core/state/selectedFile/selectFile.actions';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { selectSelectedFile } from '../../core/state/selectedFile/selectedFile.selectors';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { SelectModule } from 'primeng/select';
import { IftaLabelModule } from 'primeng/iftalabel';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { categorySort, hideNeglectable } from '../../core/state/dataFilters/dataFilters.actions';
import { uploadFile } from '../../core/state/dataFiles/dataFiles.actions';
import { RequestStatusEnum, SortOptions, SortOptionsEnum } from '../../core/helpers/constants';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    BarChartComponent, PieChartComponent, FormsModule, ReactiveFormsModule,
    StepperModule, ButtonModule, TableModule, CommonModule,
    CardModule, CheckboxModule, DividerModule, SelectModule,
    IftaLabelModule, FileUploadModule, ToastModule
  ],
  providers: [MessageService],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.less'
})
export class DashboardComponent implements OnInit, OnDestroy {
  dataFiles: UploadedFile[];
  selectedFile: UploadedFile;

  hideNeglectableControl = new FormControl(false, Validators.required);
  categorySortControl = new FormControl(SortOptionsEnum.DEFAULT, Validators.required);

  sortOptions = SortOptions;

  private _unsubscribeAll: Subject<void> = new Subject<void>();
  
  constructor(
    private _dataService: DataService,
    private _store: Store,
    private messageService: MessageService
  ) {}
  
  ngOnInit(): void {
    this._dataService.readSavedFiles();

    this._store.select<UploadedFile[]>(selectDataFiles)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((files) => {
        this.dataFiles = files;
        this._store.dispatch(selectFile({ dataFile: files[0] }));
        this._dataService.saveHistory(this.dataFiles.slice(0, 5));
      });
    this._store.select<UploadedFile>(selectSelectedFile)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((file) => {
        this.selectedFile = file;
      });

    this.hideNeglectableControl.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((value) => {
        if (value !== null) {
          this._store.dispatch(hideNeglectable({ hide: value }));
        }
      });
    this.categorySortControl.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((value) => {
        if (value !== null) {
          this._store.dispatch(categorySort({ sort: value }));
        }
      });

    this._store.select<RequestStatusEnum>(selectUploadFileStatus)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((status) => {
        if (status === RequestStatusEnum.ERROR) {
          this._store.select<RequestStatusEnum>(selectUploadFileError)
            .pipe(take(1))
            .subscribe((error) => {
              this.messageService.add({ 
                severity: 'error', 
                summary: 'Error', 
                detail: `
                  ${error}
                  Please ensure you're uploading valid json-file with content alike:
                  [{category: stringName, value: numberValue}];
                  value can't be negative number
                ` 
              });
            })
        }
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  getNumericFlag(label: string) {
    switch(label) {
      case 'bar': return 1;
      case 'pie': return 2;
      default: return 0;
    }
  }

  selectFile($event: any) {
    const fileSelected = $event.data;
    if (fileSelected.id !== this.selectedFile.id) {
      this._store.dispatch(selectFile({ dataFile: fileSelected }));
    }
  }

  onFileUpload($event: any) {
    this._store.dispatch(uploadFile({ file: $event.files[0] }));
  }
}
