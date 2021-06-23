import { IBlog } from "./blog";

export class EventData {

  get startAt() { return this._startAt; }
  get endAt() { return this._endAt; }
  get status() { return this._status; }
  get isFinished() { return (this.status == 'finished'); }
  get isVitual() { return true; }
  get eventOn() { return 'zoom'; }

  private _startAt: Date;
  private _endAt: Date;
  private _status: string;


  constructor(data: IBlog){
    const dS = new Date(2021, 5, 22, 16, 50);
    this._startAt = dS;

    const dE = new Date(dS.getTime());
    dE.setMinutes(dE.getMinutes() + data.readLength);
    this._endAt = dE;

    const now = new Date();
    let status: string;
    if (this._startAt.getTime() - now.getTime() > 60 * 60 * 1000) {
      status = 'upcoming';
    } else if (this._startAt.getTime() - now.getTime() > 0) {
      status = 'open soon';
    } else if (this._endAt.getTime() - now.getTime() > 0) {
      status = 'on going';
    } else {
      status = 'finished';
    }
    this._status = status;
  }
}