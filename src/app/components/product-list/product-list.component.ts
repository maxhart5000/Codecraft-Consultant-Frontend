/*
 * Product List TypeScript
 * Handles listing and pagination of products
 */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from 'src/app/common/cart-item';
import { Product } from 'src/app/common/product';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {
  // Properties for product list and pagination
  products: Product[] = [];
  currentCategoryId: number = 1;
  currentCategoryName: string = '';
  searchMode: boolean = false;
  thePageNumber: number = 1;
  thePageSize: number = 10;
  theTotalElements: number = 0;
  theKeyword: string = '';

  // Previous category and keyword for pagination
  previousCategoryId: number = 1;
  previousKeyword: string = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Subscribe to route changes
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    });
  }

  // Method to handle listing products based on route parameters
  listProducts() {
    // Check if search mode is active
    this.searchMode = this.route.snapshot.paramMap.has('id');

    // Call appropriate method based on have id or not
    if (this.searchMode) {
      this.handleListProducts();
    } else {
      this.handleSearchProducts();
    }
  }

  // Method to handle searching products
  handleSearchProducts() {
    // Retrieve keyword from route parameters
    this.theKeyword = this.route.snapshot.paramMap.get('keyword')!;
    if (this.theKeyword === null || this.theKeyword === "") {
      this.currentCategoryName = "All Products";
      this.theKeyword = '';
    }
    else {
      this.currentCategoryName = "Search: " + this.theKeyword;
    }
    console.log('theKeyword = ' + this.theKeyword);

    // Handle pagination for search results
    if (this.previousKeyword != this.theKeyword) {
      this.thePageNumber = 1;
    }

    this.previousKeyword = this.theKeyword;

    // Call productService to search for products
    this.productService
      .searchProductsPaginate(
        this.thePageNumber - 1,
        this.thePageSize,
        this.theKeyword
      )
      .subscribe(this.processResult());
  }

  // Method to handle listing products by category
  handleListProducts() {
    // Retrieve category id from route parameters
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');

    // Set category id and name

    this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;
    this.currentCategoryName = this.route.snapshot.paramMap.get('name')!;

    // Handle pagination for category products
    if (this.previousCategoryId != this.currentCategoryId) {
      this.thePageNumber = 1;
    }

    this.previousCategoryId = this.currentCategoryId;

    // Call productService to retrieve products by category
    this.productService
      .getProductListPaginate(
        this.thePageNumber - 1,
        this.thePageSize,
        this.currentCategoryId
      )
      .subscribe(this.processResult());
  }

  // Method to process result from productService
  processResult() {
    return (data: any) => {
      this.products = data._embedded.products;
      this.thePageNumber = data.page.number + 1;
      this.thePageSize = data.page.size;
      this.theTotalElements = data.page.totalElements;
    };
  }

  // Method to update page size
  updatePageSize(pageSize: string) {
    this.thePageSize = +pageSize;
    this.thePageNumber = 1;
    this.listProducts();
  }

  // Method to add product to cart
  addToCart(product: Product) {
    const theCartItem = new CartItem(product);
    this.cartService.addToCart(theCartItem);
  }
}
