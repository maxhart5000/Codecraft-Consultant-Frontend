import { Component, OnInit } from '@angular/core';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-cart-status',
  templateUrl: './cart-status.component.html',
  styleUrls: ['./cart-status.component.css'],
})
export class CartStatusComponent implements OnInit {
  totalPrice: number = 0.0; // Initialize total price
  totalQuantity: number = 0; // Initialize total quantity

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.updateCartStatus(); // Call method to update cart status when component initializes
  }

  // Method to update cart status
  updateCartStatus() {
    // Subscribe to the cart totalPrice observable
    this.cartService.totalPrice.subscribe((data) => (this.totalPrice = data));

    // Subscribe to the cart totalQuantity observable
    this.cartService.totalQuantity.subscribe(
      (data) => (this.totalQuantity = data)
    );
  }
}
