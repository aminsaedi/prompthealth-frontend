import { Component, Input } from '@angular/core';
import { BASIC_CARD, BOOK_STRATEGY_CALL, GROWTH_PANEL, PLAN_SECTION, PRO_CARD } from './offer-copy';

/*
 * "Choose How You Want to Grow" (Hedieh's section 2), the same on
 * /for-practitioners and /plans: two parts a visitor can tell apart at a
 * glance. Memberships first, Basic and Pro as equal cards that differ only in
 * their accent, neither marked as the popular one. Then, after clear space,
 * Growth as one dark full-width panel rather than a third card, with no price.
 *
 * Her brief of 2026-10-08: Pro offers Join for dental clinics and Apply for
 * everyone else, and Growth is two balanced columns, its details beside a
 * summary card. Both pages get the same section, so the three offers are
 * positioned the same way on each (her section 5). Since her brief of
 * 2026-10-09 the card has one button, Book a Strategy Call, which opens the
 * inquiry form on /for-dentists; Apply for Growth is gone.
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
  public readonly book = BOOK_STRATEGY_CALL;

  /* Her own sentence for each page. */
  get growthAvailability(): string {
    return this.source === 'plans' ? GROWTH_PANEL.card.availability.plans : GROWTH_PANEL.card.availability.forPractitioners;
  }
}
