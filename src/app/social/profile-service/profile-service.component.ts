import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IOptionCheckboxGroup } from 'src/app/shared/form-item-checkbox-group/form-item-checkbox-group.component';
import { QuestionnaireMapProfilePractitioner, QuestionnaireService } from 'src/app/shared/services/questionnaire.service';
import { CategoryService } from 'src/app/shared/services/category.service';
import { SocialService } from '../social.service';

/*
 * What a practice offers.
 *
 * Every section here is a read-only view of answers the provider picked, and
 * before this each one rendered its heading whether or not they had picked
 * anything. A clinic that had answered none of them got a column of five
 * headings and five colons, which reads as a page that failed to load rather
 * than as a profile with nothing filled in yet.
 *
 * So each section now asks whether it has anything to show, and the tab says so
 * plainly when none of them do.
 */
@Component({
  selector: 'app-profile-service',
  templateUrl: './profile-service.component.html',
  styleUrls: ['./profile-service.component.scss']
})
export class ProfileServiceComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  get profile() { return this._socialService.selectedProfile; }
  get questionnaires() { return this._qService.questionnaireOf('profilePractitioner') as QuestionnaireMapProfilePractitioner; }

  /* The ids a provider has picked. One array covers several vocabularies, so
   * each section below matches it against its own. */
  private get pickedIds(): string[] { return (this.profile && this.profile.allServiceId) || []; }
  private get deliveryIds(): string[] { return (this.profile && this.profile.serviceOfferIds) || []; }

  get hasTypeOfProvider(): boolean { return this.picked(this.questionnaireAnswers('typeOfProvider')); }
  get hasSpecialty(): boolean { return this.picked(this.questionnaireAnswers('specialty')); }
  get hasTreatmentModality(): boolean { return this.picked(this.questionnaireAnswers('treatmentModality')); }
  get hasCustomerHealth(): boolean { return this.picked(this.questionnaireAnswers('customerHealth')); }
  get hasServiceDelivery(): boolean { return this.deliveryIds.length > 0; }

  /* The service list is drawn from the category tree rather than from a
   * questionnaire, so it is asked of the categories. */
  get hasServices(): boolean {
    const flat = this._catService.categoryListFlatten || [];
    return flat.some(cat => this.pickedIds.indexOf(cat._id) >= 0);
  }

  get hasAnything(): boolean {
    return this.hasTypeOfProvider || this.hasSpecialty || this.hasTreatmentModality
      || this.hasCustomerHealth || this.hasServiceDelivery || this.hasServices;
  }

  /* A clinic and a solo practitioner read the same fields, but "Type of
   * Provider" is the wrong noun for a practice with a team. */
  get providerTypeLabel(): string {
    return this.profile && this.profile.isC ? 'Practitioner types' : 'Type of Provider';
  }

  private questionnaireAnswers(key: 'typeOfProvider' | 'specialty' | 'treatmentModality' | 'customerHealth'): any[] {
    const q = this.questionnaires ? (this.questionnaires as any)[key] : null;
    return (q && q.answers) || [];
  }

  /* An answer counts as picked if the provider chose it, or chose any of the
   * options nested underneath it. */
  private picked(answers: any[]): boolean {
    const ids = this.pickedIds;
    if (!ids.length) { return false; }
    return answers.some(answer => {
      if (ids.indexOf(answer._id) >= 0) { return true; }
      const subs = answer.subansData || [];
      return subs.some((sub: any) => ids.indexOf(sub._id) >= 0);
    });
  }

  public optionNestedFormCheckboxGroup: IOptionCheckboxGroup = {
    showBlockWithZeroMarginWhenDisabled: true,
    showInlineSubWhenDisabled: true,
    removeIndentSub: true,
    fontSmallSub: true
  };

  public optionFormCheckboxGroup: IOptionCheckboxGroup = {
    showInlineWhenDisabled: true,
    inlineSeparator: ', ',
  };

  private subscription: Subscription;

  constructor(
    private _socialService: SocialService,
    private _qService: QuestionnaireService,
    private _catService: CategoryService,
  ) { }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.subscription) { this.subscription.unsubscribe(); }
  }

  ngOnInit(): void {
    this.subscription = this._socialService.selectedProfileChanged()
      .pipe(takeUntil(this.destroy$)).subscribe(() => {});
  }
}
