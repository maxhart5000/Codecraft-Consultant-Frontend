import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { OKTA_AUTH } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';
import { Observable, from, lastValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthInterceptorService implements HttpInterceptor {
  constructor(@Inject(OKTA_AUTH) private oktaAuth: OktaAuth) {}

  /**
   * Intercepts HTTP requests and adds authorization headers for secured endpoints.
   * @param request The HTTP request.
   * @param next The HTTP handler.
   * @returns An observable of the HTTP event.
   */
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return from(this.handleAccess(request, next));
  }

  /**
   * Handles access to secured endpoints by adding authorization headers.
   * @param request The HTTP request.
   * @param next The HTTP handler.
   * @returns A promise of the HTTP event.
   */
  private async handleAccess(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Promise<HttpEvent<any>> {
    const endPoint = environment.hartcodeApiUrl + '/orders';
    const securedEndpoints = [endPoint];

    // Check if the request URL includes any of the secured endpoints
    if (securedEndpoints.some((url) => request.urlWithParams.includes(url))) {
      const accessToken = this.oktaAuth.getAccessToken();

      // Clone the request and add the authorization header
      request = request.clone({
        setHeaders: {
          Authorization: 'Bearer ' + accessToken,
        },
      });
    }

    // Send the modified request to the next handler and return the response
    return await lastValueFrom(next.handle(request));
  }
}