import { Component, Input, OnInit } from '@angular/core';
import { IPlanData, IPlanFeatureData, PlanType } from '../../../models/default-plan';
import { expandVerticalAnimation } from '../../../_helpers/animations';

@Component({
  selector: 'table-plan-feature',
  templateUrl: './table-plan-feature.component.html',
  styleUrls: ['./table-plan-feature.component.scss'],
  animations: [expandVerticalAnimation],
})
export class TablePlanFeatureComponent implements OnInit {

  @Input() plans: {[k in PlanType]: IPlanData};
  @Input() planFeatures: IPlanFeatureData[];

  public isHeaderSticked = false;
  public idxSelectedFeature = -1;

  keepOriginalOrder = (a: any, b: any) => a.key;
  isFeatureApplicable(i: number, planType: PlanType) {
    return this.planFeatures[i].targetPlan.includes(planType);
  }

  constructor() { }

  ngOnInit(): void {
  }

  onChangeHeaderStickStatus(sticked: boolean) {
    this.isHeaderSticked = sticked;
  }

  showDetail(i: number) {
    this.idxSelectedFeature = (this.idxSelectedFeature == i) ? -1 : i;
  }
}
