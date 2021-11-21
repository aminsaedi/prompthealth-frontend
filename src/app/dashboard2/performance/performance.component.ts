import { Component, OnInit } from '@angular/core';
import { ProfileManagementService } from 'src/app/shared/services/profile-management.service';

@Component({
  selector: 'app-performance',
  templateUrl: './performance.component.html',
  styleUrls: ['./performance.component.scss']
})
export class PerformanceComponent implements OnInit {

  get user() { return this._profileService.profile; }
  
  constructor(
    private _profileService: ProfileManagementService,
  ) { }

  ngOnInit(): void {
  }

}
