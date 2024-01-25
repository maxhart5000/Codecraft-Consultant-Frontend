import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupName } from '@angular/forms';
import { Country } from 'src/app/common/country';
import { State } from 'src/app/common/state';
import { ShopFormService } from 'src/app/services/shop-form.service';

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

  constructor(private formBuilder: FormBuilder,
              private shopFormService: ShopFormService) {}

  ngOnInit(): void {
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: [''],
        lastName: [''],
        email: [''],
      }),
      shippingAddress: this.formBuilder.group({
        street: [''],
        town: [''],
        state: [''],
        country: [''],
        postCode: [''],
      }),
      billingAddress: this.formBuilder.group({
        street: [''],
        town: [''],
        state: [''],
        country: [''],
        postCode: [''],
      }),
      creditCard: this.formBuilder.group({
        cardType: [''],
        nameOnCard: [''],
        cardNumber: [''],
        cvv: [''],
        expirationMonth: [''],
        expirationYear: [''],
      }),
    });

    // Populate credit card months
    const startMonth: number = new Date().getMonth() + 1;
    console.log("startMonth:" + startMonth);

    this.shopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrieved credit card months: " + JSON.stringify(data))
        this.creditCardMonths = data;
      }
    )

    // Populate credit card years
    this.shopFormService.getCreditCardYears().subscribe(
      data => {
        console.log("Retrieved credit card years: " + JSON.stringify(data));
        this.creditCardYears = data;
      }
    )

    // Populate countries
    this.shopFormService.getCountries().subscribe(
      data => {
        console.log("Retrieved countries: " + JSON.stringify(data));
        this.countries = data;
      }
    )
  }

  onSubmit() {
    console.log('Handling the submit button');
    console.log(this.checkoutFormGroup.get('customer')?.value);
    console.log(
      'The email address is: ' +
        this.checkoutFormGroup.get('customer')?.value.email
    );
    console.log('The shipping address country is ' + this.checkoutFormGroup.get('shippingAddress')?.value.country.name);
    console.log('The shipping address state is ' + this.checkoutFormGroup.get('shippingAddress')?.value.state.name);
  }

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
  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup?.value.expirationYear);

    // If the current year equals the selected year, then start with the current month
    let startMonth: number;

    if(currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }

    this.shopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrieved credit card months: " + JSON.stringify(data));
        this.creditCardMonths = data; 
      }
    );
  }

  getStates(formGroupName: string) {
    
    const formGroup = this.checkoutFormGroup.get(formGroupName);

    const countryCode = formGroup?.value.country.code;
    const countryName = formGroup?.value.country.name;

    console.log('Country Code: ' + countryCode);
    console.log('Country Name: ' + countryName)

    this.shopFormService.getStates(countryCode).subscribe(
      data => {
        if(formGroupName === 'shippingAddress') {
          console.log("Retrieved Shipping Address States: " + JSON.stringify(data));
          this.shippingAddressStates = data;
        }
        else {
          console.log("Retrieved Billing Address States: " + JSON.stringify(data));
          this.billingAddressStates = data;
        } 
        formGroup?.get('state')?.setValue(data[0]);
      }
    );
  }
}