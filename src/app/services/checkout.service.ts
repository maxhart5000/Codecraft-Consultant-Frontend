import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Purchase } from '../common/purchase';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private purchaseUrl = environment.hartcodeApiUrl + '/checkout/purchase';

  constructor(private httpCLient: HttpClient) {}

  placeOrder(purchase: Purchase): Observable<any> {
    return this.httpCLient.post<Purchase>(this.purchaseUrl, purchase);
  }
}
