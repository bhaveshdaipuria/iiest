import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { waterTestFee, clientType, paymentMode, licenceType } from '../../../utils/config';
import { RegisterService } from '../../../services/register.service';
import { GetdataService } from '../../../services/getdata.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-fbonew',
  templateUrl: './fbonew.component.html',
  styleUrls: ['./fbonew.component.scss']
})
export class FbonewComponent implements OnInit {
  isQrCode = false;
  userName: string = '';
  userData: any;
  minValue: number = 1;
  loggedUser: any;
  objId: string;
  editedData: any;
  parsedUserData: any;
  submitted = false;
  waterTestFee = waterTestFee;
  clientType = clientType;
  paymentMode = paymentMode;
  licenceType = licenceType;
  isDisabled: boolean = true;
  fboGeneralData: any;
  productList:any;
  productName: any;
  processAmnt: any;
  processAmnts: any = {};
  serviceName: any;
  servicesNames: any = {};
  addFbo: any;
  isFostac: boolean = false;
  isFoscos: boolean = false;
  recipientORshop: string = 'Recipients';
  isEditMode: boolean = false;
  formType: string = "Registration";
  isReadOnly: boolean = false;
  resetMultiDrop: boolean;
  need_gst_number: boolean = false;
  isBusinessTypeB2B: boolean = false;
  selected: any; // related to multi drop-down, remove it if are removing multi-dropdown component
  fostac_processAmnt: number = 0;
  foscos_processAmnt: number = 0;
  fboForm : FormGroup;
  maxSelectedItems:number = 2;
  constructor(
    private formBuilder: FormBuilder,
    private _getFboGeneralData: GetdataService,
    private _registerService: RegisterService,
    private _toastrService: ToastrService
  ) {
    this.getFboGeneralData();
  }
  ngOnInit(): void {
    this.userData = this._registerService.LoggedInUserData();
    this.parsedUserData = JSON.parse(this.userData)
    this.userName = this.parsedUserData.employee_name;
    this.fboForm = this.formBuilder.group(
      {
        fbo_name: ['', Validators.required],
        owner_name: ['', Validators.required],
        owner_contact: ['',
          [
            Validators.required,
            Validators.pattern(/^[0-9]{10}$/)
          ]],
        email: ['',
          [
            Validators.required,
            Validators.email,
          ]],
        state: ['', Validators.required],
        district: ['', Validators.required],
        address: ['', Validators.required],
        village: [''],
        tehsil: [''],
        pincode: [''],
        product_name: [[], Validators.required],
        business_type: ['b2c', Validators.required],
        payment_mode: ['', Validators.required],
        createdBy: ['', Validators.required],
        grand_total: ['', Validators.required],
        fostac_training : this.formBuilder.group({
          fostac_processing_amount: ['', Validators.required],
          fostac_service_name: ['', Validators.required],
          fostac_client_type: ['', Validators.required],
          recipient_no: ['', Validators.required],
          fostac_total: ['', Validators.required]
        }),
        foscos_training :this.formBuilder.group({
          foscos_processing_amount: ['', Validators.required],
          foscos_service_name: ['', Validators.required],
          foscos_client_type: ['', Validators.required],
          shops_no: ['', Validators.required],
          water_test_fee: ['', Validators.required],
          license_category: ['', Validators.required],
          license_duration: ['', Validators.required],
          foscos_total: ['', Validators.required]
        })
    });

    this.fboForm.patchValue({ createdBy: `${this.userName}(${this.parsedUserData.employee_id})` })
  }
  get fbo(): { [key: string]: AbstractControl } {
    return this.fboForm.controls;
  }

  get fostac(): FormGroup {
    return this.fboForm.get('fostac_training') as FormGroup;
  }

  get foscos(): FormGroup {
    return this.fboForm.get('foscos_training') as FormGroup;
  }


  setRequired() {
    return [Validators.required];
  }
  //Form Submit Method
  onSubmit() {

    this.loggedUser = this._registerService.LoggedInUserData();
    this.objId = JSON.parse(this.loggedUser)._id;
     if (this.fbo['product_name'].errors) {
      alert();
    //   //this.multiSelect.invalid = true;
    } else {
    //   //this.multiSelect.invalid = false;
     }
    this.submitted = true;
    console.log(this.fboForm.value);
    if (this.fboForm.invalid) {
      return;
    }

    if (this.isEditMode) {
      this.editedData = this.fboForm.value;
      this._registerService.updateFbo(this.objId, this.editedData, `${this.userName}(${this.parsedUserData.employee_id})`).subscribe({
        next: (res) => {
          if (res.success) {
            this._toastrService.success('Record edited successfully', res.message);
            this.backToRegister();
          }
        }
      });
    } else {
      this.addFbo = this.fboForm.value;
      if (this.addFbo.payment_mode === 'Pay Page') {
        this._registerService.fboPayment(this.objId, this.addFbo).subscribe({
          next: (res) => {
            window.location.href = res.message;
          },
          error: (err) => {
            let errorObj = err.error;
            if (errorObj.userError) {
              this._registerService.signout();
            } else if (errorObj.contactErr) {
              this._toastrService.error('Message Error!', errorObj.contactErr);
            } else if (errorObj.emailErr) {
              this._toastrService.error('Message Error!', errorObj.emailErr);
            }
          }
        })
      } else {
        console.log(this.addFbo)
        this._registerService.addFbo(this.objId, this.addFbo).subscribe({
          next: (res) => {
            if (res.success) {
              this._toastrService.success('Record edited successfully', res.message);
              this.backToRegister();
            }
          },
          error: (err) => {
            let errorObj = err.error;
            if (errorObj.userError) {
              this._registerService.signout();
            } else if (errorObj.contactErr) {
              this._toastrService.error('Message Error!', errorObj.contactErr);
            } else if (errorObj.emailErr) {
              this._toastrService.error('Message Error!', errorObj.emailErr);
            }
          }
        })
      }
    }
  }


  //Get Fbo General Data
  getFboGeneralData() {
    this._getFboGeneralData.getFboGeneralData().subscribe({
      next: (res) => {
        this.fboGeneralData = res.product_name;
        this.fboGeneralData = Object.entries(this.fboGeneralData).map(([key, value]) => ({ key, value }));
        console.log(this.fboGeneralData);
        let productList = Object.keys(res.product_name);
        //console.log(this.productList)
        this.productList = productList.map((name, index) => ({
          id: index + 1,
          name,
          disabled: (name !== 'Fostac Training' && name != 'Foscos Training')// Set 'disabled' property based on condition
        }));
        
       
        for (let productName in res.product_name) {
          let product = res.product_name[productName];
          this.processAmnts[productName] = product['processing_amount'];
          this.servicesNames[productName] = product['service_name'];
        }
      },
      error: (err) => {
        let errorObj = err.error
        if (errorObj.userError) {
          this._registerService.signout();
        }
      }
    })
  }

  //Reset the form
  onReset(): void {
    this.submitted = false;
    this.fboForm.reset();
    this.need_gst_number = false; // this will hide gst number on form reset 
    this.isFostac = false;
    this.isFoscos = false;
    this.fboForm.removeControl('gst_number')// this will remove gst number form control on form reset 
    this.fboForm.removeControl('fostac_training');
    this.fboForm.removeControl('foscos_training');
  }

 getSelectedProduct($event:any){
  console.log($event);
  const fostacExists = $event.some((item: { name: string; }) => item.name === 'Fostac Training');
  const foscosExists = $event.some((item: { name: string; }) => item.name === 'Foscos Training');
  if(fostacExists){
    this.isFostac = true;
  }else{this.isFostac = false;}
  if(foscosExists){
    this.isFoscos = true;
  }else{this.isFoscos = false;}
  
 }
  //Get Product List
  getProduct(event: any) {
    
    this.clearFunc();
    this.isQrCode = false;
    
    this.productName = event;
    this.fboForm.patchValue({ product_name: this.productName })
    var filtered = this.fboGeneralData.filter((a: any) => this.productName.find((item: any) => item === a.key))
    console.log(filtered);
   

    this.isFostac = false;
    this.isFoscos = false;
    if (this.productName.find((item: any) => item === 'Fostac Training')) {
      this.isFostac = true;
      this.fboForm.addControl('fostac_training', this.fostac_training);
    }
    else {
      this.fboForm.removeControl('fostac_training');
    }
    if (this.productName.find((item: any) => item === 'Foscos Training')) {
      this.recipientORshop = 'Shops';
      this.isFoscos = true;
      this.fboForm.addControl('foscos_training', this.foscos_training);
    }
    else {
      this.fboForm.removeControl('foscos_training');
    }

  }
  foscos_training(arg0: string, foscos_training: any) {
    throw new Error('Method not implemented.');
  }
  fostac_training(arg0: string, fostac_training: any) {
    throw new Error('Method not implemented.');
  }
 
 
  backToRegister() {
    this.submitted = false;
    this.isEditMode = false;
    this.fboForm.reset();
  }
  isEditRecord(param: any) {
    console.log(param.Record);
    this.isEditMode = param.isEditMode;
    const record = param.Record;
    this.objId = record._id
    console.log(record);
    this.formType = "Edit"
    this.fboForm.setValue({
      fbo_name: record.fbo_name,
      owner_name: record.owner_name,
      owner_contact: record.owner_contact,
      email: record.email,
      state: record.state,
      district: record.district,
      address: record.address,
      product_name: record.product_name,
      processing_amount: record.processing_amount,
      service_name: record.service_name,
      client_type: record.client_type,
      recipient_no: record.recipient_no,
      water_test_fee: record.water_test_fee,
      payment_mode: record.payment_mode,
      createdBy: record.createdBy,
      license_category: record.license_category,
      license_duration: record.license_duration,
      total_amount: record.total_amount
    })
  }

  
  
  ModeofPayment(event: any) {
    if (this.fboForm.value.total_amount !== '' && event.target.value == 'Pay Page') {
      this.isQrCode = true;
    } else {
      this.isQrCode = false;
    }
  }

  //On Product Change clear these inputs
  clearFunc() {
    this.fboForm.patchValue({ 'processing_amount': '' })
    this.fboForm.patchValue({ 'client_type': '' })
    this.fboForm.patchValue({ 'recipient_no': '' })
    this.fboForm.patchValue({ 'total_amount': '' })
    this.fboForm.patchValue({ 'service_name': '' })
  }


  // This function conditionally add gst number filled in fbo form (condition: If checkox B2B is true in Business type field)
  onBusinessTypeChange($event: any) {
    let businessType: string = $event.target.value
    console.log(businessType);
    if (businessType) {
      if (businessType === 'b2b') { // If we have business type b2b then we want to add gst number form control
        this.need_gst_number = true;
        this.fboForm.addControl('gst_number', new FormControl('', Validators.required));
      }
      else if (businessType === 'b2c') { // If we have business type b2b then we want to remove gst number form control
        this.need_gst_number = false;
        this.fboForm.removeControl('gst_number');
      }
    } else { //if the check box is not checked then logic will work oppositely
      if (businessType === 'b2b') {
        this.need_gst_number = false;
        this.fboForm.removeControl('gst_number');
      }
      else if (businessType === 'b2c') {
        this.need_gst_number = true;
        this.fboForm.addControl('gst_number', new FormControl('', Validators.required));
      }
    }
  }

  
  foctacTotalAmount(TotalAmnt:any){
    this.fostac_processAmnt = TotalAmnt;
    this.fboForm.patchValue({ 'grand_total': TotalAmnt + this.foscos_processAmnt });
  }
  foscosTotalAmount(TotalAmnt:any){
    this.foscos_processAmnt = TotalAmnt;
    this.fboForm.patchValue({ 'grand_total': TotalAmnt + this.fostac_processAmnt });
  }
  closeDropDown(){

  }
}
