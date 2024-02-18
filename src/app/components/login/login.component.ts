import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { OKTA_AUTH } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';
import OktaSignIn from '@okta/okta-signin-widget';

import myAppConfig from 'src/app/config/my-app-config';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, AfterViewInit {
  oktaSignIn: any;

  constructor(@Inject(OKTA_AUTH) private oktaAuth: OktaAuth) {
    console.log("constructor");
  }

  ngOnInit(): void {
    // Perform initialization logic here
    console.log("ngOnInit");
    
    // Initialize OktaSignIn widget with configuration options
    this.oktaSignIn = new OktaSignIn({
      logo: 'assets/images/logo/codecraft_logo.png',
      clientId: myAppConfig.oidc.clientId,
      redirectUri: myAppConfig.oidc.redirectUri,
      issuer: myAppConfig.oidc.issuer
    });
    console.log(this.oktaSignIn.clientId);
    console.log(this.oktaSignIn.redirectUri);
    console.log(this.oktaSignIn.issuer);
    console.log(this.oktaSignIn.logo);
  }

  ngAfterViewInit(): void {
    console.log("ngAfterViewInit");
    console.log(document.getElementById('okta-sign-in-widget'));

    // Render OktaSignIn widget on the specified element
    this.oktaSignIn.renderEl(
      {
        el: '#okta-sign-in-widget', // This should match the id of the div tag in login.component.html
      },
      (response: any) => {
        if (response.status === 'SUCCESS') {
          console.log('User authenticated successfully: ' + response);
          this.oktaAuth.signInWithRedirect();
        }
      },
      (error: any) => {
        console.log('Okta Sign-In Widget error: ' + error);
        throw error;
      }
    );
  }
}