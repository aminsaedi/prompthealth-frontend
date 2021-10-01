import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

  public authType: AuthType;
  public roleType: RoleType;

  public nextPage: string;
  public nextPageKeyword: string;

  constructor(
    private _route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this._route.data.subscribe((data: {authType: AuthType}) => {
      this.authType = data.authType;
    });

    this._route.params.subscribe((param: Params) => {
      let roleType: string;
      roleType = param.type || 'U';;

      const matchRoleType = !!(roleType.match(/^(u|sp|c|p|U|SP|C|P)$/));
      this.roleType = matchRoleType ? roleType.toUpperCase() as RoleType : 'U';
    });

    this._route.queryParams.subscribe((param: Params) => {
      this.nextPage = param.next ? param.next : null;
      this.nextPageKeyword = param.nextKeyword ? param.nextKeyword : null;
    });

  }

}

type AuthType = 'signin' | 'signup';
type RoleType = 'U' | 'SP' | 'C' | 'P';