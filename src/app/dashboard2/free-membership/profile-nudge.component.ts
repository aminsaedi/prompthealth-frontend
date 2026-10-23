import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';
import { UniversalService } from 'src/app/shared/services/universal.service';
import { PROFILE_NUDGE } from 'src/app/shared/free-membership-copy';

type NudgeKey = 'city' | 'photo' | 'bio' | 'website';

/* Each item opens the profile form at its own field. The ids are on the
 * practitioner and clinic forms (form-provider-general, form-centre-general). */
const SECTION_IDS: { [key in NudgeKey]: string } = {
  city: 'profile-location',
  photo: 'profile-photo',
  bio: 'profile-bio',
  website: 'profile-website',
};

/*
 * What a practitioner's or clinic's profile still lacks (Hedieh's brief of
 * 2026-10-22, step 3): city, photo, bio and website. City matters most,
 * because the city directory pages list only profiles that have one. Read
 * from the profile held for the dashboard, so it updates as soon as a save
 * fills a field in.
 */
@Component({
  selector: 'profile-nudge',
  template: `
    <section *ngIf="missing.length" class="profile-nudge rounded-8p mb-20p" aria-labelledby="profile-nudge-heading">
      <h2 id="profile-nudge-heading" class="profile-nudge__heading mb-5p">{{ copy.heading }}</h2>
      <p class="profile-nudge__text mb-10p">{{ copy.text }}</p>
      <ul class="profile-nudge__list mb-0">
        <li *ngFor="let key of missing">
          <a href="/dashboard/profile" (click)="open($event, key)">{{ copy.items[key] }}</a>
          <span *ngIf="key === 'city'" class="profile-nudge__note d-block">{{ copy.cityNote }}</span>
        </li>
      </ul>
    </section>
  `,
  styles: [`
    .profile-nudge { padding: 16px 20px; background: #FFF8E6; border: 1px solid #F5C451; }
    .profile-nudge__heading { font-size: 18px; line-height: 26px; font-weight: 700; color: #293148; }
    .profile-nudge__text { font-size: 15px; line-height: 22px; color: #293148; }
    .profile-nudge__list { padding-left: 20px; }
    .profile-nudge__list li { font-size: 15px; line-height: 22px; margin-bottom: 6px; }
    .profile-nudge__list a { font-weight: 600; text-decoration: underline; }
    .profile-nudge__note { font-size: 14px; line-height: 20px; color: #656871; }
  `],
})
export class ProfileNudgeComponent {
  public readonly copy = PROFILE_NUDGE;

  constructor(
    private _profileService: ProfileManagementService,
    private _router: Router,
    private _uService: UniversalService,
  ) {}

  get missing(): NudgeKey[] {
    const profile = this._profileService.profile;
    const user = this._profileService.user;
    if (!profile || !user || !profile.isProvider) { return []; }
    const blank = (value: any) => !String(value || '').trim();
    const keys: NudgeKey[] = [];
    if (blank(user.city)) { keys.push('city'); }
    if (blank(user.profileImage)) { keys.push('photo'); }
    /* The form's Bio field. */
    if (blank(user.product_description)) { keys.push('bio'); }
    if (blank(user.website)) { keys.push('website'); }
    return keys;
  }

  /* The form renders after its questions load, so the field is looked for a
   * few times before giving up; the page is then simply the profile. */
  open(event: Event, key: NudgeKey): void {
    event.preventDefault();
    const id = SECTION_IDS[key];
    const path = this._router.url.split(/[?#]/)[0];
    const go = path === '/dashboard/profile' ? Promise.resolve(true) : this._router.navigateByUrl('/dashboard/profile');
    go.then(() => {
      if (!this._uService.isBrowser) { return; }
      let tries = 0;
      const find = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const field = el.querySelector('input:not([type=hidden]):not([type=file]):not([disabled]), textarea') as HTMLElement;
          if (field && typeof field.focus === 'function') {
            try { field.focus({ preventScroll: true }); } catch (e) { /* older browsers */ }
          }
        } else if (tries++ < 20) {
          setTimeout(find, 100);
        }
      };
      find();
    });
  }
}
