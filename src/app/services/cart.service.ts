import { Injectable } from '@angular/core';
import { CartItem } from '../common/cart-item';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  cartItems: CartItem[] = [];

  // Use this to store data by session. i.e. per browser session
  // storage: Storage = sessionStorage;

  // Use this to store data locally. i.e. to retain data even if browser session has ended
  storage: Storage = localStorage;

  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);

  constructor() {
    // Read the data from the storage
    let data = JSON.parse(this.storage.getItem('cartItems')!);

    if (data != null) {
      this.cartItems = data;

      // Compute the totals based on data read from storage
      this.computeCartTotals();
    }
  }

  addToCart(theCartItem: CartItem) {
    // Check if we already have the item in our cart
    let alreadyExistsInCart: boolean = false;
    let existingCartItem: CartItem | undefined;

    if (this.cartItems.length > 0) {
      // Find the item in the cart based on item id
      existingCartItem = this.cartItems.find(
        (currentArrayElement) => currentArrayElement.id === theCartItem.id
      );

      // Check if we found it
      alreadyExistsInCart = existingCartItem != undefined;
    }
    if (alreadyExistsInCart) {
      // Increment the quantity
      existingCartItem!.quantity++;
    } else {
      // Just add the item to the array
      this.cartItems.push(theCartItem);
    }

    // Compute cart total price and total quantity
    this.computeCartTotals();
  }

  computeCartTotals() {
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for (let currentCartItem of this.cartItems) {
      totalPriceValue += currentCartItem.unitPrice * currentCartItem.quantity;
      totalQuantityValue += currentCartItem.quantity;
    }

    // Publish the new values... All subscribers will recieve new data
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    // Log cart data just for debugging purposes
    this.logCartData(totalPriceValue, totalQuantityValue);

    // Persist cart data
    this.persistCartItems();
  }

  persistCartItems() {
    this.storage.setItem('cartItems', JSON.stringify(this.cartItems));
  }

  logCartData(totalPriceValue: number, totalQuantityValue: number) {
    console.log('Contents of the cart');
    for (let tempCartItem of this.cartItems) {
      const subTotalPrice = tempCartItem.quantity * tempCartItem.unitPrice;
      console.log(
        'Name: ' +
          tempCartItem.name +
          ', Quantity: ' +
          tempCartItem.quantity +
          ', Unit Price: ' +
          tempCartItem.unitPrice +
          ', SubTotal: ' +
          subTotalPrice
      );
    }
    console.log(
      'Total Price: ' +
        totalPriceValue.toFixed(2) +
        ', Total Quantity: ' +
        totalQuantityValue
    );
    console.log('------');
  }

  decrementQuantity(theCartItem: CartItem) {
    theCartItem.quantity--;
    if (theCartItem.quantity === 0) {
      this.remove(theCartItem);
    } else {
      this.computeCartTotals();
    }
  }

  remove(theCartItem: CartItem) {
    // Get index of item in the array
    const itemIndex = this.cartItems.findIndex(
      (currentArrayItem) => currentArrayItem.id === theCartItem.id
    );

    // If found, remove the item from the array at the given index
    if (itemIndex > -1) {
      this.cartItems.splice(itemIndex, 1);
      this.computeCartTotals();
    }
  }
}
