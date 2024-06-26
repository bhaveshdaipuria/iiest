import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GeneralSectionComponent } from 'src/app/pages/operation/operationform/general-section/general-section.component';
import { RegisterService } from 'src/app/services/register.service';
import { IconDefinition, faFilePdf, faFileImage, faDownload, faFileZipper } from '@fortawesome/free-solid-svg-icons';
import { ViewDocumentComponent } from 'src/app/pages/modals/view-document/view-document.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { config } from 'src/app/utils/config';

@Component({
  selector: 'app-operationform',
  templateUrl: './operationform.component.html',
  styleUrls: ['./operationform.component.scss']
})

export class OperationformComponent implements OnInit {
  //global variables 
  customerId: string;
  candidateId: string = '';
  verifiedData: any;
  verifiedDataId: string;
  enrolledDataId: string;
  verifiedStatus: boolean;
  enrolledStatus: boolean;
  attendanceStatus: boolean;
  attenSecResult: string;
  salesDate: string;
  productType: string;
  conformationText: string;
  activeTab: string = 'form';
  faFilePdf: IconDefinition = faFilePdf;
  faFileImage: IconDefinition = faFileImage;
  faDownload: IconDefinition = faDownload;
  faFileZipper: IconDefinition = faFileZipper;
  documents: { name: string, src: string, format: string }[] = [];
  allDocs: any;
  isTrainer: boolean = false;

  DOC_URL: string = config.DOC_URL;

  @ViewChild(GeneralSectionComponent) generalsec: GeneralSectionComponent;

  constructor(
    private activatedRoute: ActivatedRoute,
    private _registerService: RegisterService,
    private modalService: NgbModal,
    private _utilService: UtilitiesService
  ) {
  }

  ngOnInit(): void {
    this.candidateId = this.activatedRoute.snapshot.params['id'];
    this.getUserProductType();
  }

  //this methord for geting recipient customer id 
  getCustomerId($event: any): void {
    this.customerId = $event;
  }

  //this methord catch sales date from verification section which we will pass in enrollment section
  getSalesData($event: string): void {
    this.salesDate = $event;
  }

  // this methord catch verification Id from verification section which we will pass in enrollment section
  getVerifiedDataId($event: string): void {
    this.verifiedDataId = $event;
  }

  // this methord catch verification data from verification section 
  getVerifiedData($event: string): void {
    this.verifiedData = $event;
  }

  // this methord catch verification sataus from verification section which we will pass in enrollment section
  getVerifiedStatus($event: boolean): void {
    this.verifiedStatus = $event
  }

  // this methord catch enrollment Id from Enrollment section which we will pass in Attendance section
  getEnrolledDataId($event: string): void {
    this.enrolledDataId = $event;
  }

  // this methord catch enrollment status from Enrollment section which we will pass in Attendance section
  getEnrolledStatus($event: boolean): void {
    this.enrolledStatus = $event;
  }

  // this methord catch attendance status from Attendance section which we will pass in Certification section
  getAttendanceStatus($event: boolean): void {
    this.attendanceStatus = $event;
  }

  // this methord catch attendance status from Attendance section which we will pass in Certification section
  getAttenSecResult($event: string): void {
    this.attenSecResult = $event;
  }

  getDocuments($event: any): void {
    $event.forEach((item: any) => {
      if (!this.documents.find((elem: any) => (elem.name === item.name)) && item.src) {
        this.documents.push(item);
      }
    });
    this.allDocs = this.documents.flatMap(doc => doc.src);
  }

  getFileIcon(type: string): IconDefinition {
    let fileIcon: IconDefinition = faFilePdf;
    switch (type) {
      case 'pdf':
        fileIcon = faFilePdf
        break;
      case 'image':
        fileIcon = faFileImage
        break;
    }
    return fileIcon
  }

  getUserProductType(): void {
    let user: any = this._registerService.LoggedInUserData();
    let parsedUser = JSON.parse(user);
    let panelType = parsedUser.panel_type;

    switch (panelType) {
      case 'Fostac Panel':
        this.productType = 'Fostac';
        break;
      case 'Foscos Panel':
        this.productType = 'Foscos';
        break;
      case 'HRA Panel':
        this.productType = 'HRA';
        break;
      case 'FSSAI Training Panel':
        this.productType = 'Fostac';
        this.isTrainer = true;
        break;
      default:
        this.productType = 'Fostac';
    }
  }

  toogleTabs(tab: string): void {
    this.activeTab = tab;
  }

  viewDocument(res: any): void {
    const modalRef = this.modalService.open(ViewDocumentComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.doc = res;
  }

  downloadDoc(documentId: string, contentType: string) {
    this._utilService.downloadDoc(documentId, contentType);
  }
}
