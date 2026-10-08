import { Component, Input } from '@angular/core';
import { BASIC_CARD, GROWTH_PANEL, PLAN_SECTION, PRO_CARD } from './offer-copy';

/*
 * "Choose How You Want to Grow" (Hedieh's section 2), the same on
 * /for-practitioners and /plans: two parts a visitor can tell apart at a
 * glance. Memberships first, Basic and Pro as equal cards that differ only in
 * their accent, neither marked as the popular one. Then, after clear space,
 * Growth as one dark full-width panel rather than a third card, with no price.
 */
@Component({
  selector: 'plan-choice',
  templateUrl: './plan-choice.component.html',
  styleUrls: ['./plan-choice.component.scss'],
})
export class PlanChoiceComponent {
  /* Stored with an application, to tell the two pages apart. */
  @Input() source: 'for-practitioners' | 'plans' = 'for-practitioners';
  /* The section's own background, to suit the page around it. */
  @Input() sectionClass = 'bg-lightgreen';

  public readonly section = PLAN_SECTION;
  public readonly cards = [BASIC_CARD, PRO_CARD];
  public readonly growth = GROWTH_PANEL;
  public readonly photo = GROWTH_PANEL.photo;
}
