// Import necessary modules and components from Angular
import { Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ProductService } from './services/product.service';
import { Routes, RouterModule, Router } from '@angular/router';
import { ProductCategoryMenuComponent } from './components/product-category-menu/product-category-menu.component';
import { SearchComponent } from './components/search/search.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CartStatusComponent } from './components/cart-status/cart-status.component';
import { CartDetailsComponent } from './components/cart-details/cart-details.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './components/login/login.component';
import { OktaAuthModule, OktaCallbackComponent, OktaAuthGuard, OktaConfig } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';
import myAppConfig from './config/my-app-config';
import { MembersPageComponent } from './components/members-page/members-page.component';
import { OrderHistoryComponent } from './components/order-history/order-history.component';
import { AuthInterceptorService } from './services/auth-interceptor.service';
import { LoginStatusComponent } from './components/login-status/login-status.component';

// Configuration for Okta authentication
const moduleConfig: OktaConfig = {
  oktaAuth: new OktaAuth(myAppConfig.oidc)
};

// Define the routes for the application
const routes: Routes = [
  // Order History route
  { path: 'order-history', component: OrderHistoryComponent, canActivate: [OktaAuthGuard], data: { onAuthRequired: (_oktaAuth: OktaAuth, injector: Injector) => {
    const router = injector.get(Router);
    router.navigate(['/login']);
  }} },
  // Members Page route
  { path: 'members', component: MembersPageComponent, canActivate: [OktaAuthGuard], data: { onAuthRequired: (_oktaAuth: OktaAuth, injector: Injector) => {
    const router = injector.get(Router);
    router.navigate(['/login']);
  }} },
  // Okta Callback route
  { path: 'login/callback', component: OktaCallbackComponent },
  // Login route
  { path: 'login', component: LoginComponent },
  // Checkout route
  { path: 'checkout', component: CheckoutComponent, canActivate: [OktaAuthGuard], data: { onAuthRequired: (_oktaAuth: OktaAuth, injector: Injector) => {
    const router = injector.get(Router);
    router.navigate(['/login']);
  }} },
  // Cart Details route
  { path: 'cart-details', component: CartDetailsComponent },
  // Product Details route
  { path: 'products/:id', component: ProductDetailsComponent },
  // Search route
  { path: 'search/:keyword', component: ProductListComponent },
  // Category route with ID and name parameters
  { path: 'category/:id/:name', component: ProductListComponent },
  // Category route
  { path: 'category', component: ProductListComponent },
  // Products route
  { path: 'products', component: ProductListComponent },
  // Default route redirects to Products route
  { path: '', redirectTo: '/products', pathMatch: 'full' },
  // Wildcard route redirects to Products route
  { path: '**', redirectTo: '/products', pathMatch: 'full' },
];

@NgModule({
  declarations: [
    // Declare all the components used in the application
    AppComponent,
    ProductListComponent,
    ProductCategoryMenuComponent,
    SearchComponent,
    ProductDetailsComponent,
    CartStatusComponent,
    CartDetailsComponent,
    CheckoutComponent,
    LoginComponent,
    LoginStatusComponent,
    MembersPageComponent,
    OrderHistoryComponent,
  ],
  imports: [
    // Import necessary modules
    RouterModule.forRoot(routes),
    BrowserModule,
    HttpClientModule,
    NgbModule,
    ReactiveFormsModule,
    OktaAuthModule.forRoot(moduleConfig),
  ],
  providers: [
    // Provide services and interceptors
    ProductService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true },
  ],
  bootstrap: [AppComponent], // Bootstrap the AppComponent
})
export class AppModule {} // Export the AppModule
