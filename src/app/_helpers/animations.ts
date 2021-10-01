import { trigger, transition, animate, style, query, animateChild, group, stagger, state } from '@angular/animations';
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

export const slideVerticalReverseAnimation = trigger('slideVerticalReverse', [
  transition(':enter', [
    style({ display: 'block', opacity: 0, transform: 'translateY(-50px)'}),
    animate('300ms ease', style({opacity: 1, transform: 'translateY(0)'}))
  ]),
  transition(':leave', [
    animate('300ms ease', style({opacity: 0, transform: 'translateY(-50px)'}))
  ])
]);

export const slideVerticalStaggerAnimation = trigger('slideVerticalStagger', [
  transition('* => -1', [
    query(':leave', [
      style({opacity: 0}),
    ])
  ]),
  transition('* => *', [
    query(':leave, .hide', [
      stagger(-130, [
        animate('300ms ease', style({opacity: 0, transform: 'translateY(50px)'})),
      ]),
    ], { optional: true }),
    query(':enter, .show', [
      style({opacity: 0, transform: 'translateY(50px)'}),
      stagger(130, [
        animate('300ms ease', style({opacity: 1, transform: 'translateY(0'})),
      ])
    ], { optional: true }),
  ]),
]);


export const expandAllAnimation = trigger('expandAll', [
  transition(':enter', [
    style({ display: 'block', height: 0, width: 0, opacity: 0 }),
    animate('300ms ease', style({ height: '*', width: '*', opacity: 1 }))
  ]),
  transition(':leave', [
    animate('300ms ease', style({ height: '0', width: '0', opacity: 0 }))
  ])
]);

export const expandVerticalAnimation = trigger('expandVertical', [
  transition(':enter, shrink => expand', [
    style({ display: 'block', height: 0, opacity: 0 }),
    animate('300ms ease', style({ height: '*', opacity: 1 }))
  ]),
  transition(':leave, expand => shrink', [
    animate('300ms ease', style({ height: '0', opacity: 0 })),
    style({height: 0}),
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
]);

export const slideInSocialProfileChildRouteAnimation = trigger('socialProfileChildRouteAnimation', [
  /** slide to left */
  transition('1=>2, 1=>3, 1=>4, 1=>5, 1=>6, 2=>3, 2=>4, 2=>5, 2=>6, 3=>4, 3=>5, 3=>6, 4=>5, 4=>6, 5=>6', [
    style({position: 'relative', height: '100vh'}),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%'
      })
    ], {optional: true}),
    query(':enter', [
      style({left: '100%'}),
    ], {optional: true}),
    query(':leave', animateChild(), {optional: true}),
    group([
      query(':leave', [
        animate('300ms ease-out', style({left: '-100%'})),
      ], {optional: true}),
      query(':enter', [
        animate('300ms ease-out', style({left: 0})),
      ], {optional: true}),
    ]),
    query(':enter', animateChild(), {optional: true}),
  ]),
  transition('6=>5, 6=>4, 6=>3, 6=>2, 6=>1, 5=>4, 5=>3, 5=>2, 5=>1, 4=>3, 4=>2, 4=>1, 3=>2, 3=>1, 2=>1', [
    style({position: 'relative', height: '100vh'}),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%'
      })
    ], {optional: true}),
    query(':enter', [
      style({left: '-100%'}),
    ], {optional: true}),
    query(':leave', animateChild(), {optional: true}),
    group([
      query(':leave', [
        animate('300ms ease-out', style({left: '100%'})),
      ], {optional: true}),
      query(':enter', [
        animate('300ms ease-out', style({left: 0})),
      ], {optional: true}),
    ]),
    query(':enter', animateChild(), {optional: true}),
  ]),
]);

