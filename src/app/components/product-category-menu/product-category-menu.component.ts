import { Component, OnInit } from '@angular/core';
import { ProductCategory } from 'src/app/common/product-category';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-category-menu',
  templateUrl: './product-category-menu.component.html',
  styleUrls: ['./product-category-menu.component.css'],
})
export class ProductCategoryMenuComponent implements OnInit {
  // Array to hold product categories
  productCategories: ProductCategory[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    // Load product categories when component initializes
    this.listProductsCategories();
  }

  // Fetch product categories from the service
  listProductsCategories() {
    this.productService.getProductCategories().subscribe((data) => {
      // Assign fetched product categories to the array
      this.productCategories = data;
    });
  }
}
