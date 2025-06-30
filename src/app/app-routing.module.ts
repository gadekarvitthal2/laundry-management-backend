import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistrationComponent } from './registration/registration.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './auth/auth.guard';
import { CustomerRegistrationComponent } from './customer-registration/customer-registration.component';
import { CustomerDetailsComponent } from './customer-details/customer-details.component';
import { DressMasterComponent } from './dress-master/dress-master.component';
import { DashboardMasterComponent } from './dashboard-master/dashboard-master.component';
import { SaleReportComponent } from './sale-report/sale-report.component';
import { DressReportsComponent } from './dress-reports/dress-reports.component';
import { ViewCustomerDetailComponent } from './view-customer-detail/view-customer-detail.component';
import { PrintBillComponent } from './print-bill/print-bill.component';
import { RollPressMasterComponent } from './roll-press-master/roll-press-master.component';

const routes: Routes = [
  { path: 'register', component: RegistrationComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'dashboard-master', component: DashboardMasterComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'customer-registration', component: CustomerRegistrationComponent },
  { path: 'sale-report', component: SaleReportComponent, canActivate: [AuthGuard] },
  { path: 'dress-report', component: DressReportsComponent, canActivate: [AuthGuard] },
  { path: 'customer-details', component: CustomerDetailsComponent ,canActivate: [AuthGuard]},
  { path: 'dress-master', component: DressMasterComponent, canActivate: [AuthGuard] },
  { path: 'view-customer-details', component: ViewCustomerDetailComponent, canActivate: [AuthGuard] },
  { path: 'print-bill', component: PrintBillComponent, canActivate: [AuthGuard] },
  { path: 'roll-press-master', component: RollPressMasterComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
