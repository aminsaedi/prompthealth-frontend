import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

  public authType: AuthType;
  public roleType: RoleType;

  constructor(
    private _route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this._route.data.subscribe((data: {authType: AuthType}) => {
      this.authType = data.authType;
    });

    this._route.params.subscribe((param: {type: string}) => {
      let roleType: string;
      roleType = param.type || 'U';;

      const matchRoleType = !!(roleType.match(/^(u|sp|c|p|U|SP|C|P)$/));
      this.roleType = matchRoleType ? roleType.toUpperCase() as RoleType : 'U';
    });

  }

}

type AuthType = 'signin' | 'signup';
type RoleType = 'U' | 'SP' | 'C' | 'P';