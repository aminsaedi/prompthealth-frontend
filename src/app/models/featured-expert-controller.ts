import { Professional } from "./professional";

export class FeaturedExpertController {

  public includePersonalMatchInFirstRow: boolean;
  public dataPerRows: Professional[][] = [];
  private ready: boolean = false;

  public addData(data: Professional[]) {
    if(this.data) {
      data.forEach(d => {
        this.data.push(d);
      });
    } else {
      this.data = data;
    }
    this.ready = true;
    this.initLayout();
  }

  private data: Professional[];
  private numRow: number = 2;

  constructor() {
    this.initLayout();
  }

  initLayout() {
    this.includePersonalMatchInFirstRow = !!(!window.innerWidth || window.innerWidth >= 768);

    let offsetRow: number = 0;
    if(this.includePersonalMatchInFirstRow) {
      offsetRow = 1;
    }

    let data: Professional[];
    if(!this.ready) {
      data = [];
      for(let i=0; i<20; i++) {
        data.push(null);
      }
    } else  {
      data = this.data;
    }

    const dataPerRows = [];
    for (let i=0; i<this.numRow; i++) {
      dataPerRows.push([]);
    }

    for (let i=0; i<data.length; i++) {
      const idxRow = (i + offsetRow) % this.numRow;
      dataPerRows[idxRow].push(data[i]);
    }
    this.dataPerRows = dataPerRows;
  }


}