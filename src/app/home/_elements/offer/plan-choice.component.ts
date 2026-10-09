import { Component, Input } from '@angular/core';
import { BASIC_CARD, BOOK_CONSULTATION, GROWTH_PANEL, PLAN_SECTION, PRO_CARD } from './offer-copy';

/*
 * "Choose How You Want to Grow" (Hedieh's section 2), the same on
 * /for-practitioners and /plans: two parts a visitor can tell apart at a
 * glance. Memberships first, Basic and Pro as equal cards that differ only in
 * their accent, neither marked as the popular one. Then, after clear space,
 * Growth as one dark full-width panel rather than a third card, with no price.
 *
 * Her brief of 2026-10-08: Pro offers Join for dental clinics and Apply for
 * everyone else, and Growth is two balanced columns, its details beside a
 * summary card whose two buttons are Book a 30-Minute Consultation and Apply
 * for Growth. Both pages get the same section, so the three offers are
 * positioned the same way on each (her section 5).
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
  public readonly book = BOOK_CONSULTATION;

  /* Her own sentence for each page. */
  get growthAvailability(): string {
    return this.source === 'plans' ? GROWTH_PANEL.card.availability.plans : GROWTH_PANEL.card.availability.forPractitioners;
  }
}
