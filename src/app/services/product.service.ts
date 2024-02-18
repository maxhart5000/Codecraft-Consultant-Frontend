import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Product } from '../common/product';
import { ProductCategory } from '../common/product-category';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private baseUrl = `${environment.hartcodeApiUrl}/products`;
  private categoryUrl = `${environment.hartcodeApiUrl}/product-category`;

  constructor(private httpClient: HttpClient) {}

  /**
   * Retrieves a paginated list of products based on the specified category ID.
   * @param thePage The page number to retrieve.
   * @param thePageSize The number of products per page.
   * @param categoryId The ID of the category to filter the products.
   * @returns An Observable of GetResponseProduct containing the paginated list of products.
   */
  getProductListPaginate(
    thePage: number,
    thePageSize: number,
    categoryId: number
  ): Observable<GetResponseProduct> {
    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${categoryId}&page=${thePage}&size=${thePageSize}`;
    console.log(`Getting products from -> ${searchUrl}`);
    return this.httpClient.get<GetResponseProduct>(searchUrl);
  }

  /**
   * Retrieves a list of product categories.
   * @returns An Observable of ProductCategory[] containing the list of product categories.
   */
  getProductCategories(): Observable<ProductCategory[]> {
    return this.httpClient
      .get<GetResponseProductCategory>(this.categoryUrl)
      .pipe(map((response) => response._embedded.productCategory));
  }

  /**
   * Searches for products based on the specified keyword.
   * @param keyword The keyword to search for in product names.
   * @returns An Observable of Product[] containing the search results.
   */
  searchProducts(keyword: string): Observable<Product[]> {
    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${keyword}`;
    return this.getProducts(searchUrl);
  }

  /**
   * Searches for products based on the specified keyword with pagination.
   * @param thePage The page number to retrieve.
   * @param thePageSize The number of products per page.
   * @param keyword The keyword to search for in product names.
   * @returns An Observable of GetResponseProduct containing the paginated search results.
   */
  searchProductsPaginate(
    thePage: number,
    thePageSize: number,
    keyword: string
  ): Observable<GetResponseProduct> {
    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${keyword}&page=${thePage}&size=${thePageSize}`;
    return this.httpClient.get<GetResponseProduct>(searchUrl);
  }

  /**
   * Retrieves a product based on the specified product ID.
   * @param theProductId The ID of the product to retrieve.
   * @returns An Observable of Product containing the product details.
   */
  getProduct(theProductId: number): Observable<Product> {
    const productUrl = `${this.baseUrl}/${theProductId}`;
    return this.httpClient.get<Product>(productUrl);
  }

  /**
   * Private helper method to retrieve products based on the specified search URL.
   * @param searchUrl The URL to retrieve the products from.
   * @returns An Observable of Product[] containing the retrieved products.
   */
  private getProducts(searchUrl: string): Observable<Product[]> {
    return this.httpClient
      .get<GetResponseProduct>(searchUrl)
      .pipe(map((response) => response._embedded.products));
  }
}

interface GetResponseProduct {
  _embedded: {
    products: Product[];
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

interface GetResponseProductCategory {
  _embedded: {
    productCategory: ProductCategory[];
  };
}
