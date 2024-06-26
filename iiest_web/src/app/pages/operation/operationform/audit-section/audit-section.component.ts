import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { faCircleCheck, faCircleExclamation, faFileArrowUp } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RegisterService } from 'src/app/services/register.service';
import { DocumentationModalComponent } from 'src/app/pages/modals/documentation-modal/documentation-modal.component';
import { hraDocuments } from 'src/app/utils/config';
import { GetdataService } from 'src/app/services/getdata.service';

@Component({
  selector: 'app-audit-section',
  templateUrl: './audit-section.component.html',
  styleUrls: ['./audit-section.component.scss']
})
export class AuditSectionComponent implements OnInit {

  //global variables
  audited: boolean = false;
  auditStatus: boolean = false;
  loading: boolean = false;

  hraDocumentsName: string[] = [];
  docList: any = []; //list of already uploaded doc
  selectedDocs: string[] = []; //var for sending a selected list of doc to doc modal by selecting them in multi select

  //input variables
  @Input() shopId: string;
  @Input() verifiedDataId: string;
  @Input() verifiedData: any;
  @Input() verifiedStatus: boolean;

  officerComments: string[] = [];

  //output event emitters
  @Output() emitScheduledDataId: EventEmitter<string> = new EventEmitter<string>;

  @Output() refreshAuditLog: EventEmitter<void> = new EventEmitter<void>;

  @Output() emitScheduledStatus: EventEmitter<boolean> = new EventEmitter<boolean>;

  //icons
  faCircleExclamation = faCircleExclamation
  faCircleCheck = faCircleCheck;
  faFileArrowUp = faFileArrowUp;

  //HRA Audit Section form 
  auditForm: FormGroup = new FormGroup({
    audit_report: new FormControl(''),
    advisory_report: new FormControl(''),
    summary_note: new FormControl(''),
  });

  constructor(private formBuilder: FormBuilder,
    private _registerService: RegisterService,
    private _getDataService: GetdataService,
    private ngbModal: NgbModal) {
  }

  ngOnInit(): void {
    this.hraDocumentsName = hraDocuments.map((item: any) => item.name);
    this.auditForm = this.formBuilder.group({
      audit_report: ['', Validators.required],
      advisory_report: ['', Validators.required],
      // summary_note: ['', Validators.required],
    });
    this.getDocs();
  }

  get auditform(): { [key: string]: AbstractControl } {
    return this.auditForm.controls;
  }

  getDocs(): void { //methord for getting uploaed doc list from backend for passing it to doc modal and doc-tab
    this._getDataService.getDocs(this.shopId).subscribe({
      next: res => {
        this.docList = res.docs; 
        this.refreshAuditLog.emit();
      }
    });
  }

  onAudit() {
    console.log("Hit");
    this.audited = true;
    if (this.auditForm.invalid) {
      return;
    }
    this.loading = true;//starts the loading
    console.log(this.verifiedDataId);
    if (this.verifiedDataId) {
      const auditeData = { ...this.auditForm.value };
      console.log(auditeData);
      // this._registerService.enrollRecipient(this.verifiedDataId, auditeData).subscribe({
      //   next: res => {
      //     this.auditStatus = true;
      //     this.loading = false;
      //   },
      //   error: err => {
      //     console.log(err.error);
      //     this.loading = false;
      //   }
      // });
    }
  }

  getSelectedDocs($event: string[]): void { // this methord set the selected doc by th help of multidoc
    this.selectedDocs = $event;
  }

  openDocumentationModal() { //this methord opens the doc modal 
    const modalRef = this.ngbModal.open(DocumentationModalComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.docsArr = hraDocuments.filter((item: any) => this.selectedDocs.includes(item.name.toString()));
    modalRef.componentInstance.shopId = this.shopId;
    modalRef.componentInstance.docList = this.docList;
    modalRef.componentInstance.reloadData.subscribe(() => {
      this.getDocs();
      modalRef.componentInstance.docList = this.docList;
    });
  }

}