import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { waterTestFee, clientType } from '../../utils/config';
import { RegisterService } from '../../services/register.service';
import { GetdataService } from '../../services/getdata.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-fbo',
  templateUrl: './fbo.component.html',
  styleUrls: ['./fbo.component.scss']
})
export class FboComponent implements OnInit {
  submitted = false;
  waterTestFee = waterTestFee;
  clientType = clientType;
  isDisabled: boolean = true;
  fboGeneralData: any;
  productList: string[] = [];
  productName: any;
  processAmnt: any;
  serviceName: any;
  addFbo: any;

  fboForm: FormGroup = new FormGroup({
    fbo_name: new FormControl(''),
    owner_name: new FormControl(''),
    owner_contact: new FormControl(''),
    email: new FormControl(''),
    state: new FormControl(''),
    district: new FormControl(''),
    address: new FormControl(''),
    product_name: new FormControl(''),
    processing_amount: new FormControl(''),
    service_name: new FormControl(''),
    client_type: new FormControl(''),
    recipient_no: new FormControl(''),
    water_test_fee: new FormControl('')
    // water_test_apply : new FormControl(true)
  })


  constructor(
    private formBuilder: FormBuilder,
    private _getFboGeneralData: GetdataService,
    private _registerService: RegisterService,
    private _toastrService: ToastrService
  ) {
    this.getFboGeneralData();
  }
  ngOnInit(): void {

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
        product_name: ['', Validators.required],
        processing_amount: ['', Validators.required],
        service_name: ['', Validators.required],
        client_type: ['', Validators.required],
        recipient_no: ['', Validators.required],
        water_test_fee: ['']
      });

  }
  get fbo(): { [key: string]: AbstractControl } {
    return this.fboForm.controls;
  }

  waterTestToggel(ckeckVal: any) {
    //console.log(ckeckVal.target.checked);
    this.isDisabled = !this.isDisabled
    if (this.isDisabled) {
      this.fboForm.get('water_test')?.disable();
    } else {
      this.fboForm.get('water_test')?.enable();
    }
  }
  onSubmit() {
    this.submitted = true;
    if (this.fboForm.invalid) {
      return;
    }

    console.log(JSON.stringify(this.fboForm.value, null, 2));
    this.addFbo = this.fboForm.value;
    this._registerService.addFbo(this.addFbo)
      .subscribe((response: any) => {
        if (response.success) {
          this._toastrService.success('Message Success', response.message)
        } else {
          this._toastrService.error('Message Error!', response.message);
        }
        //console.log(response);
      });
      this.onReset();
  }


  getEmployees() {
    /* this._getDataService.getGenericData().subscribe( {
      next: (res) => { 
        console.log(res)
      },
      error: (err) => {
        let errorObj = err.error
        this.error = true;
        this.errorMgs = errorObj.message
      },
      complete: () =>{ 
        //console.info('complete')
      } 
  }) */
  }

  //Get Fbo General Data
  getFboGeneralData() {
    this._getFboGeneralData.getFboGeneralData().subscribe({
      next: (res) => {
        this.fboGeneralData = res.product_name;
        console.log(this.fboGeneralData);
        this.fboGeneralData = Object.entries(this.fboGeneralData).map(([key, value]) => ({ key, value }));
        this.productList = Object.keys(res.product_name);
      },
      error: (err) => {
        let errorObj = err.error
        //this.error = true;
        //this.errorMgs = errorObj.message
      },
      complete: () => {
        //console.info('complete')
      }
    })
  }

  onReset(): void {
    this.submitted = false;

    this.fboForm.reset();
  }
  getProduct(event: any) {
    this.productName = event.target.value;
    var filtered = this.fboGeneralData.filter((a: any) => a.key == this.productName)
    filtered = filtered[0].value;
    this.processAmnt = Object.values(filtered.processing_amount);
    this.serviceName = Object.values(filtered.service_name);
    //console.log(this.processAmnt , this.serviceName)
  }

}

