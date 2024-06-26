import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IconDefinition, faCheck, faCircleCheck, faCircleExclamation, faL } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';
import { MultiSelectComponent } from 'src/app/shared/multi-select/multi-select.component';
import { hraKob, ownershipType } from 'src/app/utils/config';

@Component({
  selector: 'app-verification-section',
  templateUrl: './verification-section.component.html',
  styleUrls: ['./verification-section.component.scss']
})
export class VerificationSectionComponent implements OnInit, OnChanges {
  //general variables
  verified: boolean = false;
  verifiedStatus: boolean = false;
  // isPropraitor: boolean = false;
  minMembers: number = 1; // this var is for deciding min no of owners in case of partnership or board of directors
  // ownersNum: number = 0; // this var is for deciding the no of owners in case of partnership or board of directors
  // indexArr: number[] = []; //this var is used for converting ownersNum to array of increasing num till ownerNum because we are using this with ngFor and ngFor works only with array
  ownerType: string = '';

  //icons
  faCircleExclamation = faCircleExclamation;
  faCircleCheck = faCircleCheck;

  //var related to loader
  loading: boolean = false;

  // input variables
  @Input() candidateId: string = '';

  @Input() productType: string = '';

  @Input() isTrainer: boolean = false;

  //output variables
  @Output() emitVerifiedID: EventEmitter<string> = new EventEmitter<string>;

  @Output() emitVerifiedData: EventEmitter<any> = new EventEmitter<any>;

  @Output() emitVerifiedStatus: EventEmitter<boolean> = new EventEmitter<boolean>;

  @Output() refreshAuditLog: EventEmitter<void> = new EventEmitter<void>;

  @Output() emitCustomerId: EventEmitter<string> = new EventEmitter<string>;

  @Output() emitDocuments: EventEmitter<any> = new EventEmitter<any>

  @ViewChild(MultiSelectComponent) multiSelect: MultiSelectComponent;

  @ViewChildren('fieldVerification') fieldVerifications: QueryList<ElementRef>

  kobData: any;

  kobList: string[] = [];

  hraKob: string[] = hraKob;

  foodCategoryList: string[] = [];

  ownershipType = ownershipType;

  //icons
  faCheck: IconDefinition = faCheck;

  //Verification Reactive angular form
  verificationForm: FormGroup = new FormGroup({});

  fostacVerificationForm: FormGroup = new FormGroup({
    recipient_name: new FormControl(''),
    fbo_name: new FormControl(''),
    owner_name: new FormControl(''),
    father_name: new FormControl(''),
    dob: new FormControl(''),
    address: new FormControl(''),
    operator_contact_no: new FormControl(''),
    email: new FormControl(''),
    aadhar_no: new FormControl(''),
    pancard_no: new FormControl(''),
    fostac_total: new FormControl(''),
    sales_person: new FormControl(''),
  });

  foscosVerificationForm: FormGroup = new FormGroup({
    operator_name: new FormControl(''),
    fbo_name: new FormControl(''),
    owner_name: new FormControl(''),
    operator_contact_no: new FormControl(''),
    email: new FormControl(''),
    address: new FormControl(''),
    pincode: new FormControl(''),
    state: new FormControl(''),
    district: new FormControl(''),
    village: new FormControl(''),
    tehsil: new FormControl(''),
    license_category: new FormControl(''),
    license_duration: new FormControl(''),
    foscos_total: new FormControl(''),
    sales_date: new FormControl(''),
    sales_person: new FormControl(''),
    kob: new FormControl(''),
    food_category: new FormControl(''),
    ownership_type: new FormControl(''),
    owners_num: new FormControl(this.minMembers)
    });

    hraVerificationForm: FormGroup = new FormGroup({
      manager_name: new FormControl(''),
      fbo_name: new FormControl(''),
      owner_name: new FormControl(''),
      manager_contact_no: new FormControl(''),
      email: new FormControl(''),
      address: new FormControl(''),
      pincode: new FormControl(''),
      state: new FormControl(''),
      district: new FormControl(''),
      hra_total: new FormControl(''),
      sales_date: new FormControl(''),
      sales_person: new FormControl(''),
      kob: new FormControl(''),
      food_handler_no: new FormControl(''),
      audit_date: new FormControl('')
      });

  constructor(private formBuilder: FormBuilder,
    private _registerService: RegisterService,
    private _getDataService: GetdataService,
    private _toastrService: ToastrService) {

  }

  ngOnInit(): void {

    this.setFormValidation();

    this.getMoreCaseInfo();

    switch (this.productType) {
      case 'Fostac':
        this.verificationForm = this.fostacVerificationForm;

        this.getFostacVerifiedData();

        break;

      case 'Foscos':

        this.getKobData();

        this.verificationForm = this.foscosVerificationForm;

        this.getFoscosVerifiedData()
        break;
      
      case 'HRA': 
        this.verificationForm = this.hraVerificationForm;
        this.getHraVerifiedData();
       break;
    }

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes['productType'] && changes['productType'].currentValue) {
      switch (this.productType) {
        case 'Fostac':
          this.verificationForm = this.fostacVerificationForm;
          break;
        case 'Foscos':
          this.verificationForm = this.foscosVerificationForm;
          break;
        case 'HRA':
          this.verificationForm = this.hraVerificationForm;
          break;
      }
    }

  }

  get verificationform(): { [key: string]: AbstractControl } {
    return this.verificationForm.controls;
  }


  onVerify(): void {
    if (this.fieldVerifications.find((div: any) => div.nativeElement.getAttribute('valid') === 'false')) {
      this._toastrService.warning('Please verify all fields first')
      return
    }
    this.verified = true;
    if (this.verificationForm.invalid) {
      return
    }
    this.loading = true;
    if (this.productType === 'Fostac') {
      this._registerService.verifyFostac(this.candidateId, this.verificationForm.value).subscribe({
        next: res => {
          if (res.success) {
            this.verifiedStatus = true;
            this.emitVerifiedStatus.emit(this.verifiedStatus);
            this.emitVerifiedID.emit(res.verifiedId);
            this.emitVerifiedData.emit({...res.verificationInfo, batchData: res.batchData});
            this.refreshAuditLog.emit();
            this.loading = false;
            this._toastrService.success('Recipient\'s Information is Verified', 'Verified');
          }
        },
        error: err => {
          this.loading = false;
          if(err.error.locationErr){
            this._toastrService.error('Location not avilable');
          } else if(err.error.emailErr) {
            this._toastrService.error('This email already exists');
          } else {
            this._toastrService.error(err.error.messsage, 'Can\'t Verify');
          }
        }
      })
    } else if (this.productType === 'Foscos') {
      this._registerService.verifyFoscos(this.candidateId, this.verificationForm.value).subscribe({
        next: res => {
          if (res.success) {
            this.loading = false;
            this.verifiedStatus = true;
            this.emitVerifiedStatus.emit(this.verifiedStatus);
            this.emitVerifiedID.emit(res.verifiiedId);
            this.emitVerifiedData.emit(res.verificationInfo);
            this.refreshAuditLog.emit();
            this._toastrService.success('Shop\'s Information is Verified', 'Verified');
          }
        }
      });
    } else if (this.productType === 'HRA') {
      this._registerService.verifyHra(this.candidateId, this.verificationForm.value).subscribe({
        next: res => {
          if (res.success) {
            this.loading = false;
            this.verifiedStatus = true;
            this.emitVerifiedStatus.emit(this.verifiedStatus);
            this.emitVerifiedID.emit(res.verifiiedId);
            this.emitVerifiedData.emit(res.verificationInfo);
            this.refreshAuditLog.emit();
            this._toastrService.success('Shop\'s Information is Verified', 'Verified');
          }
        }
      });
    }
  }

  //founction for fetching recipient data 
  getMoreCaseInfo(): void {
    this._getDataService.getMoreCaseInfo(this.candidateId).subscribe({
      next: (res) => {
        if (this.productType === 'Fostac') {
          this.emitCustomerId.emit(res.populatedInfo.recipientId);
          this.verificationForm.patchValue({ recipient_name: res.populatedInfo.name });
          this.verificationForm.patchValue({ fbo_name: res.populatedInfo.salesInfo.fboInfo.fbo_name });
          this.verificationForm.patchValue({ owner_name: res.populatedInfo.salesInfo.fboInfo.owner_name });
          this.verificationForm.patchValue({ address: res.populatedInfo.salesInfo.fboInfo.address });
          this.verificationForm.patchValue({ recipient_contact_no: res.populatedInfo.phoneNo });
          this.verificationForm.patchValue({ aadhar_no: res.populatedInfo.aadharNo });
          this.verificationForm.patchValue({ fostac_total: res.populatedInfo.salesInfo.fostacInfo.fostac_total });
          this.verificationForm.patchValue({ sales_date: this.getFormatedDate(res.populatedInfo.salesInfo.createdAt) });
          this.verificationForm.patchValue({ sales_person: res.populatedInfo.salesInfo.employeeInfo.employee_name });
        } else if (this.productType === 'Foscos') {
          this.verificationForm.patchValue({ operator_name: res.populatedInfo.operatorName });
          this.verificationForm.patchValue({ fbo_name: res.populatedInfo.salesInfo.fboInfo.fbo_name });
          this.verificationForm.patchValue({ owner_name: res.populatedInfo.salesInfo.fboInfo.owner_name });
          this.verificationForm.patchValue({ operator_contact_no: res.populatedInfo.salesInfo.fboInfo.owner_contact });
          this.verificationForm.patchValue({ email: res.populatedInfo.salesInfo.fboInfo.email });
          this.verificationForm.patchValue({ address: res.populatedInfo.address });
          this.verificationForm.patchValue({ state: res.populatedInfo.state });
          this.verificationForm.patchValue({ district: res.populatedInfo.district });
          this.verificationForm.patchValue({ pincode: res.populatedInfo.pincode });
          this.verificationForm.patchValue({ village: res.populatedInfo.village });
          this.verificationForm.patchValue({ tehsil: res.populatedInfo.tehsil });
          this.verificationForm.patchValue({ license_category: res.populatedInfo.salesInfo.foscosInfo.license_category });
          this.verificationForm.patchValue({ license_duration: res.populatedInfo.salesInfo.foscosInfo.license_duration });
          this.verificationForm.patchValue({ foscos_total: res.populatedInfo.salesInfo.foscosInfo.foscos_total });
          this.verificationForm.patchValue({ sales_date: this.getFormatedDate(res.populatedInfo.salesInfo.createdAt) });
          this.verificationForm.patchValue({ sales_person: res.populatedInfo.salesInfo.employeeInfo.employee_name });
          this.emitDocuments.emit([
            {
              name: 'Electricity Bill',
              src: [res.populatedInfo.eBillImage],
              format: 'image',
              multiplDoc: false
            },
            {
              name: 'Owner Photo',
              src: [res.populatedInfo.ownerPhoto],
              format: 'image',
              multipleDoc: false
            },
            {
              name: 'Shop Photo',
              src: [res.populatedInfo.shopPhoto],
              format: 'image',
              multipleDoc: false
            },
            {
              name: 'Aadhar',
              src: res.populatedInfo.aadharPhoto,
              format: 'image',
              multipleDoc: true
            }
          ]);
        } else if(this.productType === 'HRA') {
          this.verificationForm.patchValue({ manager_name: res.populatedInfo.managerName });
          this.verificationForm.patchValue({ fbo_name: res.populatedInfo.salesInfo.fboInfo.fbo_name });
          this.verificationForm.patchValue({ owner_name: res.populatedInfo.salesInfo.fboInfo.owner_name });
          this.verificationForm.patchValue({ manager_contact_no: res.populatedInfo.managerContact });
          this.verificationForm.patchValue({ email: res.populatedInfo.managerEmail });
          this.verificationForm.patchValue({ address: res.populatedInfo.address });
          this.verificationForm.patchValue({ state: res.populatedInfo.state });
          this.verificationForm.patchValue({ kob: res.populatedInfo.kob });
          this.verificationForm.patchValue({ food_handler_no: res.populatedInfo.foodHandlersCount });
          this.verificationForm.patchValue({ district: res.populatedInfo.district });
          this.verificationForm.patchValue({ pincode: res.populatedInfo.pincode });
          this.verificationForm.patchValue({ hra_total: res.populatedInfo.salesInfo.hraInfo.hra_total });
          this.verificationForm.patchValue({ sales_date: this.getFormatedDate(res.populatedInfo.salesInfo.createdAt) });
          this.verificationForm.patchValue({ sales_person: res.populatedInfo.salesInfo.employeeInfo.employee_name });
          this.emitDocuments.emit([
            {
              name: 'Fostac Certificate',
              src: [res.populatedInfo.fostacCertificate],
              format: 'image',
              multiplDoc: false
            },
            {
              name: 'Foscos License',
              src: [res.populatedInfo.foscosLicense],
              format: 'image',
              multipleDoc: false
            }
          ]);
        }
      }
    });
  }

  getFostacVerifiedData(): void {
    this._getDataService.getFostacVerifedData(this.candidateId).subscribe({
      next: res => {
        if (res) {
          this.verifiedStatus = true;
          this.emitVerifiedStatus.emit(this.verifiedStatus);
          this.emitVerifiedID.emit(res.verifedData._id);
          this.verificationForm.patchValue({ father_name: res.verifedData.fatherName });
          this.verificationForm.patchValue({ dob: this.getFormatedDate(res.verifedData.dob) });
          this.verificationForm.patchValue({ email: res.verifedData.email });
          this.verificationForm.patchValue({ pancard_no: res.verifedData.pancardNo });
          this.fieldVerifications.forEach((div: any) => div.nativeElement.setAttribute('valid', 'true'));
          this.emitVerifiedData.emit({...res.verifedData, batchData:res.batchData});
          this.loading = false;
        } else {
          this.verifiedStatus = false;
          this.emitVerifiedStatus.emit(this.verifiedStatus);
          this.loading = false;
        }
      }
    });
  }

  getFoscosVerifiedData() {
    this._getDataService.getFoscosVerifedData(this.candidateId).subscribe({
      next: res => {
        if (res) {
          this.verifiedStatus = true;
          this.multiSelect.isDisplayEmpty = false;
          this.multiSelect.selected = res.verifedData.foodCategory;
          this.verificationForm.patchValue({ kob: res.verifedData.kob });
          this.verificationForm.patchValue({ ownership_type: res.verifedData.ownershipType });
          this.verificationForm.patchValue({ food_category: res.verifedData.foodCategory });
          this.verificationForm.patchValue({ operator_address: res.verifedData.operatorAddress });
          this.emitVerifiedData.emit(res.verifedData);
          this.emitVerifiedStatus.emit(this.verifiedStatus);
        } else {
          this.verifiedStatus = false;
        }
      }
    });
  }

  getHraVerifiedData() {
    this._getDataService.getHraVerifedData(this.candidateId).subscribe({
      next: res => {
        if (res) {
          this.verifiedStatus = true;
          this.verificationForm.patchValue({ audit_date: this.getFormatedDate(res.verifedData.auditDate.toString()) });
          this.emitVerifiedData.emit(res.verifedData);
          this.emitVerifiedStatus.emit(this.verifiedStatus);
        } else {
          this.verifiedStatus = false;
        }
      }
    });
  }

  getFormatedDate(date: string): string {
    const originalDate = new Date(date);
    const year = originalDate.getFullYear();
    const month = String(originalDate.getMonth() + 1).padStart(2, '0');
    const day = String(originalDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }

  getKobData(): void {
    this._getDataService.getKobData().subscribe({
      next: res => {
        this.kobData = res;
        this.kobList = this.kobData.map((elem: any) => elem.name);
      }
    })
  }

  //this methord sets food catgories on the basis of kob selection
  onKobChange($event: any): void {
    this.verificationForm.patchValue({ food_category: [] });
    this.foodCategoryList = [];
    this.multiSelect.onReset();
    this.kobData.forEach((kob: any) => {
      if (kob.name === $event.target.value) {
        this.foodCategoryList = kob.food_category;
      }
    })
  }

  getSelectedFoodcat($event: any): void {
    this.verificationForm.patchValue({ food_category: $event });
  }

  setFormValidation(): void {

    this.fostacVerificationForm = this.formBuilder.group({
      recipient_name: ['', Validators.required],
      fbo_name: ['', Validators.required],
      owner_name: ['', Validators.required],
      father_name: ['', Validators.required],
      dob: ['', Validators.required],
      address: ['', Validators.required],
      recipient_contact_no: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      aadhar_no: ['', Validators.required],
      pancard_no: ['', Validators.pattern('/^[A-Z]{5}[0-9]{4}[A-Z]$/')],
      fostac_total: ['', Validators.required],
      sales_date: ['', Validators.required],
      sales_person: ['', Validators.required],
    });

    this.foscosVerificationForm = this.formBuilder.group({
      operator_name: ['', Validators.required],
      fbo_name: ['', Validators.required],
      owner_name: ['', Validators.required],
      operator_contact_no: ['', Validators.required],
      email: ['', Validators.required],
      address: ['', Validators.required],
      state: ['', Validators.required],
      district: ['', Validators.required],
      pincode: ['', Validators.required],
      village: ['', Validators.required],
      tehsil: ['', Validators.required],
      license_category: ['', Validators.required],
      license_duration: ['', Validators.required],
      foscos_total: ['', Validators.required],
      sales_date: ['', Validators.required],
      sales_person: ['', Validators.required],
      kob: ['', Validators.required],
      food_category: ['', Validators.required],
      ownership_type: ['', Validators.required],
      owners_num: [this.minMembers, Validators.required],
    });

    this.hraVerificationForm = this.formBuilder.group({
      manager_name: ['', Validators.required],
      fbo_name: ['', Validators.required],
      owner_name: ['', Validators.required],
      manager_contact_no: ['', Validators.required],
      email: ['', Validators.required],
      address: ['', Validators.required],
      state: ['', Validators.required],
      district: ['', Validators.required],
      pincode: ['', Validators.required],
      hra_total: ['', Validators.required],
      sales_date: ['', Validators.required],
      sales_person: ['', Validators.required],
      kob: ['', Validators.required],
      food_handler_no: ['', Validators.required],
      audit_date: ['', Validators.required]
    })

  }

  onOwnershipTypeChanges($event: any) {
    if($event.target.value === 'Propaitorship') {
      this.minMembers=1;
    } else {
      this.minMembers=2;
    }
    this.verificationForm.patchValue({'owners_num': this.minMembers});
  }

  onOwnersNumChange($event: any) {
    let value = $event.target.value;
    if(value < this.minMembers){
      value = this.minMembers;
    } else if (value > 20) {
      value = 20;
    }

    this.verificationForm.patchValue({'owners_num': value});
  }

}