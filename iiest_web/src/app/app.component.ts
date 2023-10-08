import { Component, OnInit, Input } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { RegisterService } from './services/register.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})


export class AppComponent implements OnInit {
  title = 'iiest_new';
  showHeader: boolean = true;
  empName: string;
  loggedInUserData: any;
  isLoggedIn:boolean;

  constructor(
    private router: Router,
    private activateRoute: ActivatedRoute,
    private _registerService: RegisterService
  ) {
    router.events.subscribe((val) => {
      const route:any = window.location.hash;
      if (val instanceof NavigationEnd) {
        if (val.url == '/' || val.url == '/main' || route == "#about" || route == "#contact") {
          this.showHeader = false;
        } else {
          this.showHeader = true;
        }
      }
    });
    this.isLoggedIn = this._registerService.isLoggedIn();
  }
  ngOnInit(): void {
    this.loggedInUserData = this._registerService.LoggedInUserData();
    this.loggedInUserData = JSON.parse(this.loggedInUserData)
    console.log(this.loggedInUserData.employee_name);
    this.empName = this.loggedInUserData.employee_name;
  }

}
