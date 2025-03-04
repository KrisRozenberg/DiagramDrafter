import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { DataFilters, InputData, UploadedFile } from '../../../core/models/data.model';
import { Store } from '@ngrx/store';
import { selectSelectedFile } from '../../../core/state/selectedFile/selectedFile.selectors';
import { Subject, take, takeUntil } from 'rxjs';
import { categorySortValue, hideNeglectableFilter, selectDataFiltersState } from '../../../core/state/dataFilters/dataFilters.selectors';
import { DataFiltersState } from '../../../core/state/state.model';
import { FiltersEnum, SortOptionsEnum } from '../../../core/helpers/constants';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.less'
})
export class BarChartComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("barChart") barChartDiv: ElementRef;

  data: InputData[];
  filtersState: DataFilters;

  barChartConfiguredFlag: boolean = false;
  margin = {top: 30, right: 30, bottom: 70, left: 60};
  width = 350 - this.margin.left - this.margin.right;
  barHeight = 350 - this.margin.top - this.margin.bottom;

  barSVG: d3.Selection<SVGGElement, unknown, null, undefined>;
  x: d3.ScaleBand<string>;
  xAxis: d3.Selection<SVGGElement, unknown, null, undefined>;
  y: d3.ScaleLinear<number, number, never>;
  yAxis: d3.Selection<SVGGElement, unknown, null, undefined>;

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
    if (!this.barChartConfiguredFlag) {
      this.configureBarChart();
      this.barChartConfiguredFlag = true;
    }
    if (this.data?.length) {
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
    if (this.barChartConfiguredFlag) {
      this.configureData();
    }
  }

  configureBarChart() {
    this.barSVG = d3.select(this.barChartDiv.nativeElement)
      .append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.barHeight + this.margin.top + this.margin.bottom)
      .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")

      .on("mouseover", (event) => {
        if (event.target.tagName.toLowerCase() === 'rect') {
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
        }
      })
      .on("mousemove", event => {
        d3.select("#tooltip")
          .style("top", (event.pageY-50) + "px")
          .style("left",(event.pageX-50) + "px")
      })
      .on("mouseout", () => {
        d3.select("#tooltip").remove();
      });

    this.x = d3.scaleBand()
      .range([ 0, this.width ])
      .padding(0.2);
    this.xAxis = this.barSVG.append("g")
      .attr("transform", "translate(0," + this.barHeight + ")");

    this.y = d3.scaleLinear()
      .range([ this.barHeight, 0]);
    this.yAxis = this.barSVG.append("g");
  }

  configureData() {
    this.x.domain(this.data.map(d => d.category));
    this.xAxis.transition().duration(1000).call(d3.axisBottom(this.x))
      .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    this.y.domain([0, d3.max(this.data, d => d.value)!]);
    this.yAxis.transition().duration(1000).call(d3.axisLeft(this.y));
        
    this.barSVG.selectAll("rect")
      .data(this.data)
      .join("rect")
      .transition()
      .duration(1000)
        .attr('id', (smth, index) => {
          let id = this.data[index].category;
          return typeof id === 'string' ? id : null
        })
        .attr("x", d => this.x(d.category) ?? 0)
        .attr("y", d => this.y(d.value))
        .attr("width", this.x.bandwidth())
        .attr("height", d => this.barHeight - this.y(d.value))
        .attr("fill", "var(--p-primary-400)")
  }
}
