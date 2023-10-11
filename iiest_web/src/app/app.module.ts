import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http'
import{ FormsModule, ReactiveFormsModule} from '@angular/forms'
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FontAwesomeModule, FaIconLibrary, FaIconComponent } from '@fortawesome/angular-fontawesome';
import { NgxPaginationModule } from 'ngx-pagination';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { FboComponent } from './pages/fbo/fbo.component';
import { FooterComponent } from './shared/footer/footer.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { SettingPanelComponent } from './shared/setting-panel/setting-panel.component';
import { SignupComponent } from './pages/signup/signup.component';
import { HeaderComponent } from './shared/header/header.component';
import { HomeComponent } from './pages/home/home.component';
import { EmployeelistComponent } from './pages/employeelist/employeelist.component';
import { DatePipe } from '@angular/common';
import { LandingpageComponent } from './pages/landingpage/landingpage.component';
import { AuthInterceptor} from './interceptors/auth.interceptor';
//services
import {GetdataService} from './services/getdata.service'
//Toastr
import { ToastrModule } from 'ngx-toastr';
//ngxs Modules
import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { EmployeeState } from './store/state/employee.state';
import { FbolistComponent } from './pages/fbolist/fbolist.component';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    FboComponent,
    FooterComponent,
    SidebarComponent,
    SettingPanelComponent,
    SignupComponent,
    HeaderComponent,
    HomeComponent,
    EmployeelistComponent,
    LandingpageComponent,
    FbolistComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),
    BrowserAnimationsModule,
    FontAwesomeModule,
    NgxPaginationModule,
    //ngxs Modlues
    NgxsModule.forRoot([EmployeeState]),
    NgxsLoggerPluginModule.forRoot(),
    NgxsReduxDevtoolsPluginModule.forRoot(),
    ToastrModule.forRoot({
      closeButton: true,
      timeOut: 15000, // 15 seconds
      progressBar: true,
    }),
  ],
  providers: [
    DatePipe,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi :true},
    GetdataService  
],
  bootstrap: [AppComponent]
})
export class AppModule { }
