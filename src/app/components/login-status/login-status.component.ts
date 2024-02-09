import { Component, Inject, OnInit } from '@angular/core';
import { OKTA_AUTH, OktaAuthStateService } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';

@Component({
  selector: 'app-login-status',
  templateUrl: './login-status.component.html',
  styleUrls: ['./login-status.component.css'],
})
export class LoginStatusComponent implements OnInit {
  isAuthenticated: boolean = false;

  userFirstName: string = '';

  storage: Storage = sessionStorage;

  constructor(
    private oktaAuthService: OktaAuthStateService,
    @Inject(OKTA_AUTH) private oktaAuth: OktaAuth
  ) {}

  ngOnInit(): void {
    // Subscribe to the authentication state changes
    this.oktaAuthService.authState$.subscribe((result) => {
      this.isAuthenticated = result.isAuthenticated!;
      this.getUserDetails();
    });
  }
  getUserDetails() {
    if (this.isAuthenticated) {
      // Fectch the logged in user details (user's cliams)
      // User full name is exposed as a property name
      this.oktaAuth.getUser().then((res) => {

        // Retrieve the user's email, first name and last name from authentication response
        const userEmail = res.email as string;
        this.userFirstName = res.given_name as string;
        const userLastName = res.family_name as string;

        // Store email, first name and last name in browser session storage
        this.storage.setItem('userEmail', JSON.stringify(userEmail));
        this.storage.setItem('userFirstName', JSON.stringify(this.userFirstName));
        this.storage.setItem('userLastName', JSON.stringify(userLastName));
      });
    }
  }

  logout() {
    // Terminate the session with Okta and removes current tokens
    this.oktaAuth.signOut();

    // Clears the current session storage
    this.storage.clear();
  }
}
