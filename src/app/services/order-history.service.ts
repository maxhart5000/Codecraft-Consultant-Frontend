import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderHistory } from '../common/order-history';
import { environment } from 'src/environments/environment';

/**
  * Retrieves the order history for a given email.
  * @param email The email of the customer.
  * @returns An Observable of OrderHistory array.
  */
@Injectable({
  providedIn: 'root',
})
export class OrderHistoryService {
  private orderUrl = `${environment.hartcodeApiUrl}/orders`;

  constructor(private httpClient: HttpClient) {}

  getOrderHistory(email: string): Observable<OrderHistory[]> {
    const searchOrderUrl = `${this.orderUrl}/search/findByCustomerEmailOrderByDateCreatedDesc?email=${email}`;

    return this.httpClient.get<OrderHistory[]>(searchOrderUrl);
  }
}
