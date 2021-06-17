export function smoothHorizontalScrolling(e: HTMLElement, time: number, amount: number, start: number) {
  var eAmt = amount / 100;
  var curTime = 0;
  var scrollCounter = 0;
  while (curTime <= time) {
      window.setTimeout(SHS_B, curTime, e, scrollCounter, eAmt, start);
      curTime += time / 100;
      scrollCounter++;
  }
}

function SHS_B(e, sc, eAmt, start) {
  e.scrollLeft = (eAmt * sc) + start;
}