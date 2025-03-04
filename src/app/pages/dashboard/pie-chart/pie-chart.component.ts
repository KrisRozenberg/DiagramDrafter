import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { DataFilters, InputData, UploadedFile } from '../../../core/models/data.model';
import { Subject, take, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectSelectedFile } from '../../../core/state/selectedFile/selectedFile.selectors';
import { DataFiltersState } from '../../../core/state/state.model';
import { categorySortValue, hideNeglectableFilter, selectDataFiltersState } from '../../../core/state/dataFilters/dataFilters.selectors';
import { FiltersEnum, SortOptionsEnum } from '../../../core/helpers/constants';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [],
  templateUrl: './pie-chart.component.html',
  styleUrl: './pie-chart.component.less'
})
export class PieChartComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("pieChart") pieChartDiv: ElementRef;

  data: InputData[];
  filtersState: DataFilters;

  pieChartConfiguredFlag: boolean = false;
  width = 350;
  height = 350;
  margin = 40;
  radius = Math.min(this.width, this.height) / 2 - this.margin;

  pieSVG: d3.Selection<SVGGElement, unknown, null, undefined>;
  color: d3.ScaleOrdinal<string, unknown, never>;

  private _unsubscribeAll: Subject<void> = new Subject<void>();

  constructor(private _store: Store) {}
  
  ngOnInit(): void {
    this._store.select<UploadedFile>(selectSelectedFile)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((file) => {
        this.data = file?.data;
        
        if (this.filtersState) {
          if (this.filtersState.hideNeglectable) {
            this.data = this.data.filter((el) => el.value >= 1);
          }
          this.getDataSorted(this.filtersState.categorySort);
        }

        this.confugureDataIfPossible();
      });

    this._store.select<DataFiltersState>(selectDataFiltersState)
      .pipe(take(1))
      .subscribe((state) => {
        this.filtersState = {
          hideNeglectable: state.hideNeglectable,
          categorySort: state.categorySort
        } as DataFilters;
      });

    this._store.select<boolean>(hideNeglectableFilter)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((hide) => {
        this.filtersState.hideNeglectable = hide;
        this.applyFilters(FiltersEnum.HIDE_NEGLECTABLE);
      });
    
    this._store.select<SortOptionsEnum>(categorySortValue)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((sort) => {
        this.filtersState.categorySort = sort;
        this.applyFilters(FiltersEnum.CATEGORY_SORT);
      });
  }

  ngAfterViewInit(): void {
    if (this.data?.length) {
      if (!this.pieChartConfiguredFlag) {
        this.configurePieChart();
        this.pieChartConfiguredFlag = true;
      }
      this.configureData();
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  applyFilters(filterChanged: FiltersEnum) {
    switch (filterChanged) {
      case (FiltersEnum.HIDE_NEGLECTABLE): {
        if (this.data?.length) {
          if (this.filtersState.hideNeglectable) {
            this.data = this.data.filter((el) => el.value >= 1);
            this.confugureDataIfPossible();
          }
          else {
            this._store.select<UploadedFile>(selectSelectedFile)
              .pipe(take(1))
              .subscribe((file) => {
                this.data = file?.data;
                this.getDataSorted(this.filtersState.categorySort);
                this.confugureDataIfPossible();
              })
          }
        }
        break;
      }
      case (FiltersEnum.CATEGORY_SORT): {
        if (this.data?.length) {
          if (this.filtersState.categorySort === SortOptionsEnum.DEFAULT) {
            this._store.select<UploadedFile>(selectSelectedFile)
              .pipe(take(1))
              .subscribe((file) => {
                this.data = this.filtersState.hideNeglectable 
                  ? file?.data.filter((el) => el.value >= 1)
                  : file?.data;
                this.confugureDataIfPossible();
              })
          }
          else {
            this.getDataSorted(this.filtersState.categorySort);
            this.confugureDataIfPossible();
          }
        }
        break;
      }
      default: return;
    }
  }

  getDataSorted(sortValue: SortOptionsEnum) {
    switch (sortValue) {
      case (SortOptionsEnum.ASCENDING): {
        this.data = [...this.data].sort((el1, el2) => el1.category.localeCompare(el2.category));
        break;
      }
      case (SortOptionsEnum.DESCENDING): {
        this.data = [...this.data].sort((el1, el2) => el2.category.localeCompare(el1.category));
        break;
      }
      case (SortOptionsEnum.DEFAULT):
      default: return;
    }
  }

  confugureDataIfPossible() {
    if (this.pieChartConfiguredFlag) {
      this.configureData();
    }
  }

  configurePieChart() {
    this.pieSVG = d3.select(this.pieChartDiv.nativeElement)
      .append("svg")
        .attr("width", this.width)
        .attr("height", this.height)
      .append("g")
        .attr("transform", `translate(${this.width/2}, ${this.height/2})`)

      .on("mouseover", event => {
        d3.select("body")
          .append("div")
          .attr("id", "tooltip")
          .style("position", "absolute")
          .style('background', 'white')
          .style("top", (event.pageY-50) + "px")
          .style("left",(event.pageX-50) + "px")
          .append('text')
          .text(`
            category: ${event.target.id}, 
            value: ${event.target.__data__.value}
          `);
      })
      .on("mousemove", event => {
        d3.select("#tooltip")
          .style("top", (event.pageY-50) + "px")
          .style("left",(event.pageX-50) + "px")
      })
      .on("mouseout", () => {
        d3.select("#tooltip").remove();
      });

    this.color = d3.scaleOrdinal()
      .domain(this.data.map(d => d.category))
      .range(d3.schemeDark2);
  }

  configureData() {
    const pie = d3.pie();
    const values = this.data.map(d => d.value);

    this.pieSVG.selectAll("path")
      .enter()
      .data(pie(values))
      .join('path')
      // .transition()
      // .duration(1000) //uncomment for smooth transition + comment "enter()"; but console errors appear, has smth to do with "arcTween", .call(arcTween) is needed
        .attr('id', (smth, index) => {
          let id = this.data[index].category;
          return typeof id === 'string' ? id : null
        })
        .attr('d', <any>d3.arc().innerRadius(0).outerRadius(this.radius))
        .attr('fill', (smth, index) => {
          let arcColor = this.color(this.data[index].category);
          return typeof arcColor === 'string' ? arcColor : null
        })
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 1)
  }
}
