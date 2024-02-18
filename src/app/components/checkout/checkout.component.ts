import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { PaymentInfo } from 'src/app/common/payment-info';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { ShopFormService } from 'src/app/services/shop-form.service';
import { FormValidators } from 'src/app/validators/form-validators';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit {
  checkoutFormGroup!: FormGroup;

  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = [];
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  storage: Storage = sessionStorage;

  // Initialise Stripe API
  stripe = Stripe(environment.stripePublishableKey);

  paymentInfo: PaymentInfo = new PaymentInfo();
  cardElement: any;
  displayError: any = '';

  isDisabled: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private shopFormService: ShopFormService,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Read the user's eamil, first name and last name from browser session storage
    const email = JSON.parse(this.storage.getItem('userEmail')!);
    const firstName = JSON.parse(this.storage.getItem('userFirstName')!);
    const lastName = JSON.parse(this.storage.getItem('userLastName')!);

    // Setup Stripe payment form
    this.setupStripePaymentForm();

    // Populate the totalPrice and totalQuantity values
    this.reviewCartDetails();

    // Populate countries
    this.shopFormService.getCountries().subscribe((data) => {
      this.countries = data;
    });

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl(firstName, [
          Validators.required,
          Validators.minLength(2),
          FormValidators.notOnlyWhitespace,
        ]),
        lastName: new FormControl(lastName, [
          Validators.required,
          Validators.minLength(2),
          FormValidators.notOnlyWhitespace,
        ]),
        email: new FormControl(email, [
          Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ]),
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          FormValidators.notOnlyWhitespace,
        ]),
        city: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          FormValidators.notOnlyWhitespace,
        ]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        postCode: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          FormValidators.notOnlyWhitespace,
        ]),
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          FormValidators.notOnlyWhitespace,
        ]),
        city: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          FormValidators.notOnlyWhitespace,
        ]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        postCode: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          FormValidators.notOnlyWhitespace,
        ]),
      }),
      creditCard: this.formBuilder.group({}),
    });
  }

  onSubmit(): void {
    console.log('Handling the submit button');

    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      console.log('Invalid entries');
      return;
    }

    const order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    const cartItems = this.cartService.cartItems;
    const orderItems: OrderItem[] = cartItems.map(tempCartItem => new OrderItem(tempCartItem));

    const purchase = new Purchase();
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    const shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    purchase.shippingAddress = {
      ...shippingAddress,
      state: shippingAddress.state.name,
      country: shippingAddress.country.name
    };

    const billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    purchase.billingAddress = {
      ...billingAddress,
      state: billingAddress.state.name,
      country: billingAddress.country.name
    };

    purchase.order = order;
    purchase.orderItems = orderItems;

    this.paymentInfo.amount = Math.round(this.totalPrice * 100);
    this.paymentInfo.currency = 'GBP';
    this.paymentInfo.receiptEmail = purchase.customer.email;

    console.log(`this.paymentInfo.amount:  ${this.paymentInfo.amount}`);
    console.log(`this.paymentInfo.currency: ${this.paymentInfo.currency}`);
    console.log(`this.paymentInfo.email: ${this.paymentInfo.receiptEmail}`);

    if (!this.checkoutFormGroup.invalid && this.displayError.textContent === '') {
      this.processPayment(purchase);
    } else {
      this.handleInvalidForm();
    }
  }

  // Process the payment for the purchase
  processPayment(purchase: Purchase) {
    this.isDisabled = true;
    console.log('Creating payment intent');
    this.checkoutService.createPaymentIntent(this.paymentInfo).subscribe((paymentIntentResponse) => {
      this.confirmCardPayment(paymentIntentResponse.client_secret, purchase);
    });
  }

  // Confirm the card payment using the Stripe API
  confirmCardPayment(clientSecret: string, purchase: Purchase) {
    this.stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: this.cardElement,
          billing_details: {
            email: purchase.customer.email,
            name: `${purchase.customer.firstName} ${purchase.customer.lastName}`,
            address: {
              line1: purchase.billingAddress.street,
              city: purchase.billingAddress.city,
              state: purchase.billingAddress.state,
              postal_code: purchase.billingAddress.postCode,
              country: this.billingAddressCountry?.value.code,
            },
          },
        },
      },
      { handleActions: false }
    ).then((result: any) => {
      if (result.error) {
        this.handlePaymentError(result.error.message);
      } else {
        this.placeOrder(purchase);
      }
    });
  }

  // Place the order for the purchase
  placeOrder(purchase: Purchase) {
    this.checkoutService.placeOrder(purchase).subscribe({
      next: (response: any) => {
        this.handleOrderSuccess(response.orderTrackingNumber);
      },
      error: (err: any) => {
        this.handleOrderError(err.error.message);
      },
    });
  }

  // Handle invalid form submission
  handleInvalidForm() {
    this.checkoutFormGroup.markAllAsTouched();
    return;
  }

  // Handle payment error
  handlePaymentError(errorMessage: string) {
    this.isDisabled = false;
    alert(`Error processing the payment: ${errorMessage}`);
  }

  // Handle successful order placement
  handleOrderSuccess(orderTrackingNumber: string) {
    this.isDisabled = false;
    alert(`Order placed successfully. Your order tracking number is: ${orderTrackingNumber}`);
    this.resetCart();
  }

  // Handle order placement error
  handleOrderError(errorMessage: string) {
    this.isDisabled = false;
    alert(`Error processing the order: ${errorMessage}`);
  }

  // Reset the cart and form data
  resetCart() {
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    this.checkoutFormGroup.reset();

    this.router.navigateByUrl('/products');

    localStorage.removeItem('cartItems');
  }

  // Copy the shipping address to the billing address
  copyShippingAddressToBillingAddress(event: Event) {
    if ((event as any).target.checked) {
      this.checkoutFormGroup.controls['billingAddress'].setValue(
        this.checkoutFormGroup.controls['shippingAddress'].value
      );
      this.billingAddressStates = this.shippingAddressStates;
    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset();
      this.billingAddressStates = [];
    }
  }

  // Get the states for a given form group
  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);

    const countryCode = formGroup?.value.country.code;
    const countryName = formGroup?.value.country.name;

    console.log('Country Code: ' + countryCode);
    console.log('Country Name: ' + countryName);

    this.shopFormService.getStates(countryCode).subscribe((data) => {
      if (formGroupName === 'shippingAddress') {
        this.shippingAddressStates = data;
      } else {
        this.billingAddressStates = data;
      }
      formGroup?.get('state')?.setValue(data[0]);
    });
  }

  // Retrieve and display the cart details
  reviewCartDetails() {
    this.cartService.totalPrice.subscribe((totalPrice) => (this.totalPrice = totalPrice));
    this.cartService.totalQuantity.subscribe((totalQuantity) => (this.totalQuantity = totalQuantity));
  }

  // Set up the Stripe payment form
  setupStripePaymentForm() {
    // Get a handle to stripe elements
    var elements = this.stripe.elements();

    // Create a card element, hide post-code field
    this.cardElement = elements.create('card', { hidePostalCode: true });

    // Add an instance of card UI component in to the 'card-element' div
    this.cardElement.mount('#card-element');

    // Add event binding for the 'change' event on the card element
    this.cardElement.on('change', (event: any) => {
      // Get a handle to card-errors element
      this.displayError = document.getElementById('card-errors');

      if (event.complete) {
        this.displayError.textContent = '';
      } else if (event.error) {
        // Show validation error to customer
        this.displayError.textContent = event.error.message;
      }
    });
  }

  get firstName() {
    return this.checkoutFormGroup.get('customer.firstName');
  }
  get lastName() {
    return this.checkoutFormGroup.get('customer.lastName');
  }
  get email() {
    return this.checkoutFormGroup.get('customer.email');
  }
  get shippingAddressStreet() {
    return this.checkoutFormGroup.get('shippingAddress.street');
  }
  get shippingAddressCity() {
    return this.checkoutFormGroup.get('shippingAddress.city');
  }
  get shippingAddressState() {
    return this.checkoutFormGroup.get('shippingAddress.state');
  }
  get shippingAddressCountry() {
    return this.checkoutFormGroup.get('shippingAddress.country');
  }
  get shippingAddressPostCode() {
    return this.checkoutFormGroup.get('shippingAddress.postCode');
  }
  get billingAddressStreet() {
    return this.checkoutFormGroup.get('billingAddress.street');
  }
  get billingAddressCity() {
    return this.checkoutFormGroup.get('billingAddress.city');
  }
  get billingAddressState() {
    return this.checkoutFormGroup.get('billingAddress.state');
  }
  get billingAddressCountry() {
    return this.checkoutFormGroup.get('billingAddress.country');
  }
  get billingAddressPostCode() {
    return this.checkoutFormGroup.get('billingAddress.postCode');
  }
}
