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
  private purchaseUrl = `${environment.hartcodeApiUrl}/checkout/purchase`; // URL for purchase endpoint
  private paymentIntentUrl = `${environment.hartcodeApiUrl}/checkout/payment-intent`; // URL for payment intent endpoint

  constructor(private httpClient: HttpClient) {}

  /**
   * Places an order by sending a POST request to the purchase endpoint.
   * @param purchase The purchase object containing order details.
   * @returns An Observable of the response.
   */
  placeOrder(purchase: Purchase): Observable<any> {
    return this.httpClient.post<Purchase>(this.purchaseUrl, purchase);
  }

  /**
   * Creates a payment intent by sending a POST request to the payment intent endpoint.
   * @param paymentInfo The payment info object containing payment details.
   * @returns An Observable of the response.
   */
  createPaymentIntent(paymentInfo: PaymentInfo): Observable<any> {
    return this.httpClient.post<PaymentInfo>(this.paymentIntentUrl, paymentInfo);
  }
}
