import { Injectable } from "@angular/core";
import { Router, ActivatedRouteSnapshot } from "@angular/router";

@Injectable()
export class AppRoutingService {

  constructor(private router: Router) { }

  public getRouteTitle(): string {
    return this.getRouteData("state");
  }

  private getRouteData(data: string): any {
    const root = this.router.routerState.snapshot.root;
    return this.lastChild(root).data[data];
  }

  private lastChild(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
    if (route.firstChild) {
      return this.lastChild(route.firstChild);
    } else {
      return route;
    }
  }
}
