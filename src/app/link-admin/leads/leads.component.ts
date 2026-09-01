import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LinkManagerService } from 'src/app/shared/services/link-manager.service';
import { LinkAdminStore } from '../link-admin.store';

interface IClinicOption {
  clinicId: string;
  name: string;
  slug: string;
  url: string;
  teamSize: number;
  linkedMembers: number;
}

/*
 * Where the leads came from, and who they went to.
 *
 * One page, two questions, because they are the same question at two scopes.
 * With nobody picked it answers "how is the site doing at turning readers into
 * leads"; with a clinic picked it answers "what did the site do for you", in
 * the shape you would send them. Splitting those into two tabs would have meant
 * two pages that mostly look the same and a reader deciding which one they are
 * allowed to be on.
 *
 * A practitioner or a clinic signed in sees only their own figures: the picker
 * is not shown to them and the server would refuse the question anyway.
 */
@Component({
  selector: 'app-la-leads',
  templateUrl: './leads.component.html',
  styleUrls: ['./leads.component.scss'],
})
export class LeadsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  days = 30;
  loading = false;
  funnel: any = null;
  report: any = null;

  clinics: IClinicOption[] = [];
  selectedClinicId = '';

  constructor(
    public store: LinkAdminStore,
    private service: LinkManagerService,
  ) {}

  get isAdmin(): boolean { return this.store.isAdmin; }

  ngOnInit(): void {
    this.store.days$.pipe(takeUntil(this.destroy$)).subscribe(days => {
      this.days = days;
      this.load();
    });
    if (this.isAdmin) { this.loadClinics(); }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onClinicChanged(clinicId: string): void {
    this.selectedClinicId = clinicId;
    this.load();
  }

  private loadClinics(): void {
    this.service.clinics().pipe(takeUntil(this.destroy$)).subscribe(
      res => { this.clinics = (res && res.data) || []; },
      () => { this.clinics = []; },
    );
  }

  private load(): void {
    this.loading = true;
    /* An administrator with nobody picked gets the whole site; everybody else
     * gets the report, and the server decides whose. */
    const wantsFunnel = this.isAdmin && !this.selectedClinicId;
    const call = wantsFunnel
      ? this.service.funnel({ days: this.days })
      : this.service.leadReport({ days: this.days, ...(this.selectedClinicId ? { clinicId: this.selectedClinicId } : {}) });

    call.pipe(takeUntil(this.destroy$)).subscribe(
      res => {
        this.loading = false;
        if (wantsFunnel) { this.funnel = (res && res.data) || null; this.report = null; }
        else { this.report = (res && res.data) || null; this.funnel = null; }
      },
      () => { this.loading = false; },
    );
  }

  /* Of the people who looked at a kind of page, how many went on to somebody's
   * own website. Bots are already out of both halves. */
  rate(numerator: number, denominator: number): string {
    if (!denominator) { return '0%'; }
    const pct = (numerator / denominator) * 100;
    return `${pct >= 10 ? Math.round(pct) : Math.round(pct * 10) / 10}%`;
  }

  viewsOf(type: string): number {
    const row = this.funnel && this.funnel.views && this.funnel.views[type];
    return row ? row.views : 0;
  }

  peopleOf(type: string): number {
    const row = this.funnel && this.funnel.views && this.funnel.views[type];
    return row ? row.people : 0;
  }

  /* "article>practitioner>clinic" reads as a route once it is spaced out. */
  readablePath(pathType: string): string {
    if (!pathType) { return 'Straight out'; }
    return pathType.split('>').join(' then ');
  }
}
