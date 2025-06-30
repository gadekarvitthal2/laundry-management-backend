import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private baseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  registerCustomer(data: any) {
    return this.http.post(`${this.baseUrl}/customers/register`, data);
  }

  getAllCustomers() {
    return this.http.get(`${this.baseUrl}/customers/all`);
  }

  addDress(data: any) {
    return this.http.post(`${this.baseUrl}/dresses`, data);
  }

  getDressesByCustomer(customerId: string) {
    return this.http.get(`${this.baseUrl}/dresses/customer/${customerId}`);
  }

  addDressType(dress: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/dress-master`, dress);
  }

  getDresses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/dress-master`);
  }

  deleteDress(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/dress-master/${id}`);
  }

  // rollOrPress
  getRollOrPressType(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/dress-master/roll-press-master`);
  }

  addRollOrPressType(rollOrPress: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/dress-master/roll-press-master`, rollOrPress);
  }

  deleteRollOrPress(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/dress-master/roll-press-master/${id}`);
  }


  addDressesBulk(dresses: any[]) {
    return this.http.post('/api/dresses/bulk', dresses);
  }

  // orders
  createOrder(order: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/orders`, order);
  }

  updateOrderInfo(): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/customers/update-latest-order-info`,
      {}
    );
  }

  updatePickupDateById(customerId: string, pickupDate: Date): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/customers/${customerId}/update-pickup-date`,
      { pickupDate }
    );
  }

  getOrdersByRange(range: string) {
    return this.http.get<any[]>(`${this.baseUrl}/orders?range=${range}`);
  }

  getOrdersByCustomer(customerId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/orders/customer/${customerId}`
    );
  }

  getClothsReports(endPoint: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/orders/${endPoint}`);
  }

  getAllOrdersWithCustomerInfo(customerId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/orders/customer/info/${customerId}`
    );
  }

  sendAllOrdersWithCustomerInfo(
    number: number,
    message: string
  ): Observable<any[]> {
    return this.http.post<any[]>(
      `${this.baseUrl}/orders/send-pdf-and-message`,
      {
        number,
        message,
      }
    );
  }

  uploadAndSendPdf(formdata: FormData): Observable<any[]> {
    return this.http.post<any[]>(
      `${this.baseUrl}/orders/send-pdf-and-message`,
        formdata
    );
  }
}
