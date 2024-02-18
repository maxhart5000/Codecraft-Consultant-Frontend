import { Injectable } from '@angular/core';
import { CartItem } from '../common/cart-item';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  cartItems: CartItem[] = [];
  storage: Storage = localStorage;
  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);

  constructor() {
    // Retrieve cart items from local storage if available
    const data = JSON.parse(this.storage.getItem('cartItems') || 'null');
    if (data != null) {
      this.cartItems = data;
      this.computeCartTotals();
    }
  }

  /**
   * Add an item to the cart
   * @param theCartItem The item to be added
   */
  addToCart(theCartItem: CartItem) {
    let alreadyExistsInCart = false;
    let existingCartItem: CartItem | undefined;

    // Check if the item already exists in the cart
    if (this.cartItems.length > 0) {
      existingCartItem = this.cartItems.find(
        (currentArrayElement) => currentArrayElement.id === theCartItem.id
      );
      alreadyExistsInCart = existingCartItem !== undefined;
    }

    // Increment quantity if item already exists, otherwise add it to the cart
    if (alreadyExistsInCart) {
      existingCartItem!.quantity++;
    } else {
      this.cartItems.push(theCartItem);
    }

    this.computeCartTotals();
  }

  /**
   * Compute the total price and quantity of items in the cart
   */
  computeCartTotals() {
    let totalPriceValue = 0;
    let totalQuantityValue = 0;

    for (const currentCartItem of this.cartItems) {
      totalPriceValue += currentCartItem.unitPrice * currentCartItem.quantity;
      totalQuantityValue += currentCartItem.quantity;
    }

    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    this.logCartData(totalPriceValue, totalQuantityValue);

    this.persistCartItems();
  }

  /**
   * Persist the cart items to local storage
   */
  persistCartItems() {
    this.storage.setItem('cartItems', JSON.stringify(this.cartItems));
  }

  /**
   * Log the contents of the cart
   * @param totalPriceValue The total price of all items in the cart
   * @param totalQuantityValue The total quantity of items in the cart
   */
  logCartData(totalPriceValue: number, totalQuantityValue: number) {
    console.log('Contents of the cart');
    for (const tempCartItem of this.cartItems) {
      const subTotalPrice = tempCartItem.quantity * tempCartItem.unitPrice;
      console.log(
        `Name: ${tempCartItem.name}, Quantity: ${tempCartItem.quantity}, Unit Price: ${tempCartItem.unitPrice}, SubTotal: ${subTotalPrice}`
      );
    }
    console.log(
      `Total Price: ${totalPriceValue.toFixed(2)}, Total Quantity: ${totalQuantityValue}`
    );
    console.log('------');
  }

  /**
   * Decrement the quantity of an item in the cart
   * @param theCartItem The item to decrement the quantity of
   */
  decrementQuantity(theCartItem: CartItem) {
    theCartItem.quantity--;
    if (theCartItem.quantity === 0) {
      this.remove(theCartItem);
    } else {
      this.computeCartTotals();
    }
  }

  /**
   * Remove an item from the cart
   * @param theCartItem The item to be removed
   */
  remove(theCartItem: CartItem) {
    const itemIndex = this.cartItems.findIndex(
      (currentArrayItem) => currentArrayItem.id === theCartItem.id
    );

    if (itemIndex > -1) {
      this.cartItems.splice(itemIndex, 1);
      this.computeCartTotals();
    }
  }
}
