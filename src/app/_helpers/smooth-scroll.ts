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

export function smoothRootVerticalScrolling(e: HTMLElement, time: number, amount: number, start: number) {
  var eAmt = amount / 100;
  var curTime = 0;
  var scrollCounter = 0;
  while (curTime <= time) {
    window.setTimeout(SVS_B, curTime, e, scrollCounter, eAmt, start);
    curTime += time / 100;
    scrollCounter++;
  }
}

function SVS_B(e, sc, eAmt, start) {
  e.scrollTop = (eAmt * sc) + start;
}

export function smoothWindowScrollTo(to: number) {
  if(!window) {
    console.log('window is not defined. do not scroll');
    return;
  } 

  const deltaDefault = 10;
  const moveMin = 50;
  const iterationMin = 10;
  const iterationMax = 100;

  const currentPosition = window.scrollY;
  const move = (to - currentPosition);
  const moveAbs = Math.abs(move);
  if(moveAbs < moveMin) {
    console.log('too small to scroll. do not scroll');
    return;
  }

  let delta: number;
  let iteration = moveAbs / deltaDefault;
  if (iterationMin > iteration) {
    delta = (move / iterationMin);
    iteration = iterationMin;
  } else if (iteration > iterationMax) {
    delta = move / iterationMax;
    iteration = iterationMax;
  } else {
    delta = deltaDefault * move / moveAbs;
  }

  let iterationCurrent = 0;

  const interval = setInterval(() => {
    window.scrollBy({top: delta});

    if(iterationCurrent >= iteration - 1) {
      //before last scrollBy, cancel the scrollBy iteration and scroll to exact position
      clearInterval(interval);
      window.scrollTo({top: to});
    }

    iterationCurrent++;
  }, 3);

}