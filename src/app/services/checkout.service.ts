import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Purchase } from '../common/purchase';
import { environment } from 'src/environments/environment';
import { PaymentInfo } from '../common/payment-info';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private purchaseUrl = environment.hartcodeApiUrl + '/checkout/purchase';
  private paymentIntentUrl = environment.hartcodeApiUrl + '/checkout/payment-intent';

  constructor(private httpCLient: HttpClient) {}

  placeOrder(purchase: Purchase): Observable<any> {
    return this.httpCLient.post<Purchase>(this.purchaseUrl, purchase);
  }

  createPaymentIntent(paymentInfo: PaymentInfo): Observable<any> {
    return this.httpCLient.post<PaymentInfo>(this.paymentIntentUrl, paymentInfo);
  }
}
