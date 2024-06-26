import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoginComponent } from '../login/login.component';
import { faPeopleGroup, faBuilding, faLocationDot, faHome, faSignIn, faCircleInfo, faPhone } from '@fortawesome/free-solid-svg-icons';
import { RegisterService } from 'src/app/services/register.service';
import { Router } from '@angular/router';
import { OnboardModalComponent } from '../onboard-modal/onboard-modal.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-landingpage',
  templateUrl: './landingpage.component.html',
  styleUrls: ['./landingpage.component.scss'],
})
export class LandingpageComponent implements OnInit, AfterViewInit {

  faPeopleGroup = faPeopleGroup;
  faBuilding = faBuilding;
  faLocationDot = faLocationDot;
  faHome = faHome;
  faSignIn = faSignIn;
  faCircleInfo = faCircleInfo;
  faPhone = faPhone;
  isToken: boolean = false;
  isMobileNav: boolean = false;

  @ViewChild('backgroundVidRef') backgroundVidRef: ElementRef;
  // @ViewChild('headRef') headRef: ElementRef;

  constructor(
    private modalService: NgbModal,
    private _resiterService: RegisterService,
    private _toastrService: ToastrService,
    private router: Router) {

  }
  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    // this.headRef.nativeElement.style.height = this.backgroundVidRef.nativeElement.style.height;
    const bodyElement = document.body;
    bodyElement.classList.remove('app');
    this.isToken = this._resiterService.isLoggedIn();
  }

  openModal() {
    if (!this.isToken) {
      this.modalService.open(LoginComponent, { size: 'md', backdrop: 'static' });
    } else {
      const bodyElement = document.body;
      bodyElement.classList.add('app');
      this.router.navigateByUrl('/home');
    }
  }

  //methord opens the onboard ,modal if user if user is loggedin this runs on click of onboard button on landing page view
  openOnboardModal() {
    if (!this.isToken) {
      this._toastrService.info('Login Required')
      this.modalService.open(LoginComponent, { size: 'md', backdrop: 'static' });
    } else {
      this.modalService.open(OnboardModalComponent, { size: 'md', backdrop: 'static' });
    }
  }
}