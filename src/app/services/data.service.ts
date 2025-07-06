import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../envitoments/environment';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  // private baseUrl1 = 'http://localhost:5000/api';
  // private baseUrl = 'https://laundry-management-cfnd.onrender.com/api';
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  registerCustomer(data: any) {
    return this.http.post(`${this.baseUrl}/customers/register`, data);
  }

  getAllCustomers() {
    return this.http.get(`${this.baseUrl}/customers/all`);
  }

  getNextBillNo() {
    return this.http.get(`${this.baseUrl}/orders/get-next-bill-no`);
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
    return this.http.get<any[]>(
      `${this.baseUrl}/dress-master/roll-press-master`
    );
  }

  addRollOrPressType(rollOrPress: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/dress-master/roll-press-master`,
      rollOrPress
    );
  }

  deleteRollOrPress(id: string): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/dress-master/roll-press-master/${id}`
    );
  }

  updateDressPositions(items: any[]): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/dress-master/update-positions`,
      items
    );
  }

  notifyUpdateDeliveryDate(
    customerId: string,
    deliveryNotifiedDate: string,
    orderId: string
  ) {
    return this.http.patch(
      `${this.baseUrl}/orders/notify-update-delivery-date/customerid/${customerId}/orderid/${orderId}`,
      { deliveryNotifiedDate }
    );
  }

  notifyUpdateDeliveryDateIfOrderComplete(
    customerId: string,
    deliveryNotifiedDate: string,
    orderId: string
  ) {
    return this.http.patch(
      `${this.baseUrl}/orders/notify-update-delivery-complete-date/customerid/${customerId}/orderid/${orderId}`,
      { deliveryNotifiedDate }
    );
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

  updatePickupDateById(customerId: string, bookingDate: Date): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/customers/update-pickup-date/${customerId}`,
      { bookingDate }
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

  toTitleCase(str: string): string {
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
