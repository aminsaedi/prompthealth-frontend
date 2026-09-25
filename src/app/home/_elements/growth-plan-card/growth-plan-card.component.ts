import { Component, Input } from '@angular/core';
import { IconName } from 'src/app/models/icon-ph';
import { GROWTH_PLAN_CARD } from '../../growth-landing/landings/other-pages';

/*
 * PromptHealth Growth as a plan, beside the free profile on /plans and
 * /for-practitioners.
 *
 * One component because the card it replaces, the AI Visibility Program, was
 * written out on both pages and the two copies had drifted apart: different
 * feature lists, one with a "Popular" ribbon. It states no price.
 */
@Component({
  selector: 'growth-plan-card',
  templateUrl: './growth-plan-card.component.html',
  styleUrls: ['./growth-plan-card.component.scss'],
})
export class GrowthPlanCardComponent {
  /* /plans heads each plan card with an icon and /for-practitioners does not,
   * so the card follows the page it sits on. */
  @Input() icon: IconName = null;
  /* Classes for the card itself, to match the free card beside it. */
  @Input() cardClass = '';

  public card = GROWTH_PLAN_CARD;
}
