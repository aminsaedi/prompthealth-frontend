export interface IReviewData {
  rating: number;
  data: IReview[];
  stat : IReviewStatData
}

export class ReviewData implements IReviewData {
  
  get rating() { return this._rating; }
  get data() { return this._data; }
  get stat() { return this._stat; }
  get order() {
    if(this._sortId == 0) { return ['rate', 'asc']; }
    else if (this._sortId == 1) { return ['rate', 'desc']; }
    else if (this._sortId == 2) { return ['date', 'desc']; }
  }

  percentOf(rate: number) { return Math.round(this.stat[rate] / this.stat.total * 100); }

  sortBy(i: number): IReviewData['data'] {
    switch(i) {
      case 0: this._data.sort((a, b) => b.rate - a.rate); break; /** rate desc */
      case 1: this._data.sort((a, b) => a.rate - b.rate); break; /** rate asc */
      case 2: this._data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); break; /** date desc */
    }
    this._sortId = i;
    return this._data;
  }

  private _rating: number; 
  private _stat: IReviewStatData;
  private _sortId: number;

  constructor(private _data: IReview[] = []) {
    const stat: IReviewStatData = {
      total: _data.length,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    }
    let ratingTotal = 0;
    _data.forEach(d => {
      stat[d.rate] ++;
      if(typeof d == 'string') {

      } else {

      }
      ratingTotal += d.rate;
    });
    this._rating = _data.length > 0 ? Math.round(ratingTotal / _data.length * 10) / 10 : 0;
    this._stat = stat;
    this.sortBy(0);
  }
}

export interface IReview {
  name: string;
  image: string;
  rate: number;
  review: string;
  createdAt: Date;
}

interface IReviewStatData {
  total: number;
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}