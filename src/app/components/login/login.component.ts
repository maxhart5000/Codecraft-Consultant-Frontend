import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { OKTA_AUTH } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';
import OktaSignIn from '@okta/okta-signin-widget';

import myAppConfig from 'src/app/config/my-app-config';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {

  oktaSignIn: any;

  constructor(@Inject(OKTA_AUTH) private oktaAuth: OktaAuth, private router: Router) {
     this.oktaSignIn = new OktaSignIn({
      logo: 'assets/images/logo/codecraft_logo.png',
      clientId: myAppConfig.oidc.clientId,
      redirectUri: myAppConfig.oidc.redirectUri,
      issuer: myAppConfig.oidc.issuer,
    });
  }

  ngOnInit(): void {
    this.oktaSignIn.renderEl(
      {
        el: '#okta-sign-in-widget',
      }, // this name should be same as div tag id in login.component.html
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
