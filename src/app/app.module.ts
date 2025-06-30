import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CustomerRegistrationComponent } from './customer-registration/customer-registration.component';
import { CustomerDetailsComponent } from './customer-details/customer-details.component';
import { DataService } from './services/data.service';
import { DressMasterComponent } from './dress-master/dress-master.component';
import { DashboardMasterComponent } from './dashboard-master/dashboard-master.component';
import { MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { SaleReportComponent } from './sale-report/sale-report.component';
import { DressReportsComponent } from './dress-reports/dress-reports.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { ViewCustomerDetailComponent } from './view-customer-detail/view-customer-detail.component';
import { MatDialogModule } from '@angular/material/dialog';
import { OrderSummaryComponent } from './order-summary/order-summary.component';
import { PrintBillComponent } from './print-bill/print-bill.component';
import { RollPressMasterComponent } from './roll-press-master/roll-press-master.component';
import { MatSortModule } from '@angular/material/sort';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegistrationComponent,
    DashboardComponent,
    CustomerRegistrationComponent,
    CustomerDetailsComponent,
    DressMasterComponent,
    DashboardMasterComponent,
    SaleReportComponent,
    DressReportsComponent,
    ViewCustomerDetailComponent,
    OrderSummaryComponent,
    PrintBillComponent,
    RollPressMasterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    HttpClientModule,
    MatSelectModule,
    ReactiveFormsModule,
    NgxMatSelectSearchModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatCardModule,
    MatNativeDateModule,
    MatDialogModule,
    MatSortModule
  ],
  providers: [AuthService, DataService],
  bootstrap: [AppComponent],
})
export class AppModule {}
