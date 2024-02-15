import { Component, Inject, OnInit } from '@angular/core';
import { OKTA_AUTH, OktaAuthStateService } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';

@Component({
  selector: 'app-login-status',
  templateUrl: './login-status.component.html',
  styleUrls: ['./login-status.component.css'],
})
export class LoginStatusComponent implements OnInit {
  isAuthenticated: boolean = false; // Flag to check authentication status
  userFirstName: string = ''; // Variable to store user's first name

  storage: Storage = sessionStorage; // Storage object for session storage

  constructor(
    private oktaAuthService: OktaAuthStateService,
    @Inject(OKTA_AUTH) private oktaAuth: OktaAuth
  ) {}

  ngOnInit(): void {
    // Subscribe to the authentication state changes
    this.oktaAuthService.authState$.subscribe((result) => {
      this.isAuthenticated = result.isAuthenticated!;
      this.getUserDetails(); // Retrieve user details when authenticated
    });
  }

  // Method to retrieve user details (first name) when authenticated
  getUserDetails() {
    if (this.isAuthenticated) {
      this.oktaAuth.getUser().then((res) => {
        // Retrieve user's details from authentication response
        const userEmail = res.email as string;
        this.userFirstName = res.given_name as string;
        const userLastName = res.family_name as string;

        // Store user's details in session storage
        this.storage.setItem('userEmail', JSON.stringify(userEmail));
        this.storage.setItem('userFirstName', JSON.stringify(this.userFirstName));
        this.storage.setItem('userLastName', JSON.stringify(userLastName));
      });
    }
  }

  // Method to logout user and clear session storage
  logout() {
    this.oktaAuth.signOut(); // Terminate session with Okta and remove tokens
    this.storage.clear(); // Clear session storage
  }
}
