import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Country } from '../common/country';
import { State } from '../common/state';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ShopFormService {
  private countriesUrl = `${environment.hartcodeApiUrl}/countries`;
  private statesUrl = `${environment.hartcodeApiUrl}/states`;

  constructor(private httpClient: HttpClient) {}

  /**
   * Retrieves a list of countries.
   * @returns An Observable that emits an array of Country objects.
   */
  getCountries(): Observable<Country[]> {
    return this.httpClient.get<GetResponseCountries>(this.countriesUrl)
      .pipe(map(response => response._embedded.countries));
  }

  /**
   * Retrieves a list of states for a given country code.
   * @param theCountryCode The country code for which to retrieve the states.
   * @returns An Observable that emits an array of State objects.
   */
  getStates(theCountryCode: string): Observable<State[]> {
    const searchStatesUrl = `${this.statesUrl}/search/findByCountryCode?code=${theCountryCode}`;

    return this.httpClient.get<GetResponseStates>(searchStatesUrl)
      .pipe(map(response => response._embedded.states));
  }
}

interface GetResponseCountries {
  _embedded: {
    countries: Country[];
  };
}

interface GetResponseStates {
  _embedded: {
    states: State[];
  };
}
