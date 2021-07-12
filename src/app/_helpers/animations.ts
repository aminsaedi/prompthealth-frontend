import { trigger, transition, animate, style, query } from '@angular/animations';
import { translate } from '@angular/localize/src/utils';

export const fadeAnimation = trigger('fade', [
  transition(':enter', [
    style({ display: 'block', opacity: 0 }),
    animate('300ms ease', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    style({ opacity: 1 }),
    animate('300ms ease', style({ opacity: 0 }))
  ])]
);

export const fadeFastAnimation = trigger('fadeFast', [
  transition(':enter', [
    style({ display: 'block', opacity: 0 }),
    animate('100ms ease', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    style({ opacity: 1 }),
    animate('100ms ease', style({ opacity: 0 }))
  ])]
);

export const slideVerticalAnimation = trigger('slideVertical', [
  transition(':enter', [
    style({ display: 'block', opacity: 0, transform: 'translateY(50px)'}),
    animate('300ms ease', style({opacity: 1, transform: 'translateY(0)'}))
  ]),
  transition(':leave', [
    animate('300ms ease', style({opacity: 0, transform: 'translateY(50px)'}))
  ])
]);

export const expandVerticalAnimation = trigger('expandVertical', [
  transition(':enter', [
    style({ display: 'block', height: 0, opacity: 0 }),
    animate('300ms ease', style({ height: '*', opacity: 1 }))
  ]),
  transition(':leave', [
    animate('300ms ease', style({ height: '0', opacity: 0 }))
  ])
]);

/** IN (ngIf false --> true): right --> left */
/** OUT (ngIf true --> false): left --> right */
export const slideHorizontalAnimation = trigger('slideHorizontal', [
  transition(':enter', [
    style({opacity: 0, transform: 'translateX(50px)'}),
    animate('300ms ease', style({opacity: 1, transform: 'translateX(0'})),
  ]),
  transition(':leave', [
    animate('300ms ease', style({opacity: 0, transform: 'translateX(50px)'})),
  ]),
]);

/** IN (ngIf false --> true): left --> right */
/** OUT (ngIf true --> false): right --> left */
export const slideHorizontalReverseAnimation = trigger('slideHorizontalReverse', [
  transition(':enter', [
    style({opacity: 0, transform: 'translateX(-50px)'}),
    animate('300ms ease', style({opacity: 1, transform: 'translateX(0'})),
  ]),
  transition(':leave', [
    animate('300ms ease', style({opacity: 0, transform: 'translateX(-50px)'})),
  ]),
])