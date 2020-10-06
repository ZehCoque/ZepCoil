import { Component } from '@angular/core';

import { AuthenticationService } from './services/authentication.service';
import { User } from './classes/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  user: User;

  constructor(private authenticationService: AuthenticationService) {
      this.authenticationService.user.subscribe(x => this.user = x);
  }

  logout() {
      this.authenticationService.logout();
  }
}
