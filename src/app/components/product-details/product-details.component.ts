import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from 'src/app/common/cart-item';
import { Product } from 'src/app/common/product';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css'],
})
export class ProductDetailsComponent implements OnInit {
  // Product details
  product!: Product;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Load product details when component initializes
    this.route.paramMap.subscribe(() => {
      this.handleProductDetails();
    });
  }

  // Method to handle fetching product details
  handleProductDetails() {
    // Get the "id" param string and convert it to a number
    const theProductId: number = +this.route.snapshot.paramMap.get('id')!;

    // Fetch product details from the service
    this.productService.getProduct(theProductId).subscribe((data) => {
      this.product = data;
    });
  }

  // Method to add the current product to the cart
  addToCart() {
    console.log(
      'Adding to cart: ' + this.product.name + ', ' + this.product.unitPrice
    );

    // Create a CartItem from the current product and add it to the cart
    const cartItem = new CartItem(this.product);
    this.cartService.addToCart(cartItem);
  }
}
