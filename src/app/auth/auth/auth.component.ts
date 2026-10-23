import { Component, OnInit , OnDestroy } from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { getListedMenu } from "src/app/_helpers/get-listed-menu";
import { UniversalService } from "src/app/shared/services/universal.service";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: "app-auth",
  templateUrl: "./auth.component.html",
  styleUrls: ["./auth.component.scss"],
})
export class AuthComponent implements OnInit , OnDestroy {
  private destroy$ = new Subject<void>();

  get getListedProvider() {
    return getListedMenu[0];
  }
  get getListedCompany() {
    return getListedMenu[1];
  }

  public authType: AuthType;
  public roleType: RoleType;
  /* /auth/registration with no role: the two-button choice comes first. */
  public chooseRole = false;

  public nextPage: string;
  public nextPageKeyword: string;

  public readonly choice = ACCOUNT_CHOICE;
  /* The page to come back to, carried through the choice. */
  get nextQuery() {
    const query: { [key: string]: string } = {};
    if (this.nextPage) { query.next = this.nextPage; }
    if (this.nextPageKeyword) { query.nextKeyword = this.nextPageKeyword; }
    return Object.keys(query).length ? query : null;
  }

  /* /pro's Continue to Payment sends a visitor here first, with checkout as
   * the page to come back to. */
  get isProCheckout(): boolean {
    return !!this.nextPage && this.nextPage.indexOf('/pro/checkout') === 0;
  }

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _uService: UniversalService,
  ) {}

  ngOnInit(): void {
    this._route.data.subscribe((data: { authType: AuthType, chooseRole?: boolean }) => {
      this.authType = data.authType;
      this.chooseRole = !!data.chooseRole;
    });

    this._route.params.subscribe((param: Params) => {
      let roleType: string;
      roleType = param.type || "U";

      const matchRoleType = !!roleType.match(/^(u|sp|c|p|U|SP|C|P)$/);
      this.roleType = matchRoleType
        ? (roleType.toUpperCase() as RoleType)
        : "U";
      this.setMeta();
    });

    this._route.queryParams.subscribe((param: Params) => {
      this.nextPage = param.next ? param.next : null;
      this.nextPageKeyword = param.nextKeyword ? param.nextKeyword : null;
    });
  }

  /* This page set no meta, so it kept the previous page's: /auth/registration/sp
   * reached from /plans was titled "Grow Your Visibility in the Age of AI
   * Search". The roles are named as the form names them. The section is
   * noindex through setMeta, so this is for the tab and for anyone sharing
   * the link. */
  setMeta() {
    const label = ROLE_LABELS[this.roleType] || ROLE_LABELS.U;
    const signin = this.authType === "signin";
    if (!signin && this.chooseRole) {
      this._uService.setMeta(this._router.url, ACCOUNT_CHOICE.meta);
      return;
    }
    this._uService.setMeta(this._router.url, signin ? {
      title: "Sign In | PromptHealth",
      description: "Sign in to your PromptHealth account.",
    } : {
      title: `Join PromptHealth as a ${label.name} | PromptHealth`,
      description: label.description,
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

/* The account choice (Hedieh's brief of 2026-10-22, step 6): two clear
 * buttons, in her words. */
const ACCOUNT_CHOICE = {
  meta: {
    title: "Create an Account | PromptHealth",
    description: "Create a free PromptHealth account, whether you are looking for care or you are a health professional or clinic.",
  },
  intro: "Which account would you like?",
  care: {
    button: "I'm looking for care",
    text: "Find trusted health and wellness providers in Canada and follow the topics you care about.",
    link: "/auth/registration/u",
  },
  professional: {
    button: "I'm a health professional or clinic",
    text: "Create a free profile so patients can find your practice in the directory.",
    link: "/auth/registration/sp",
  },
};

const ROLE_LABELS: { [role: string]: { name: string, description: string } } = {
  U: {
    name: "Wellness Seeker",
    description: "Create a free PromptHealth account to find trusted health and wellness providers in Canada and follow the topics you care about.",
  },
  SP: {
    name: "Wellness Provider",
    description: "Create a free PromptHealth profile so patients looking for health and wellness care in Canada can find your practice.",
  },
  C: {
    name: "Wellness Provider",
    description: "Create a free PromptHealth profile so patients looking for health and wellness care in Canada can find your practice.",
  },
  P: {
    name: "Wellness Company",
    description: "Company accounts are set up by PromptHealth. Contact us to talk about partnering with PromptHealth.",
  },
};

type AuthType = "signin" | "signup";
type RoleType = "U" | "SP" | "C" | "P";
