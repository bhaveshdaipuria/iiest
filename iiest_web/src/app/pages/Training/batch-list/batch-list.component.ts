import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faEye, faPen, faSave, faCross, faCancel } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';
import { days, delhiTrainingLocations, months, trainers, venues } from 'src/app/utils/config';

@Component({
  selector: 'app-batch-list',
  templateUrl: './batch-list.component.html',
  styleUrls: ['./batch-list.component.scss']
})
export class BatchListComponent implements OnInit{
  serviceType: string = 'Catering';
  activeTab: string = 'Delhi';
  filteredData: any;
  delhiTrainingLoactions = delhiTrainingLocations;
  trainers: string[] = trainers;
  venues: {name: string, vendor: string, location: string}[] = venues;
  totalCount: number = 1;

  typeData: any;

  batchData: any;

  listType: string = '';

  editMode: any = {};//this var is used in refrencing edit mode boolean of each batch, it's will take the form as {_id1(_id of batch): boolean}

  faEye: IconDefinition = faEye;
  faPen: IconDefinition = faPen;
  faSave: IconDefinition = faSave;
  faCancel: IconDefinition = faCancel;

  // table related vars
  pageNumber: number = 1;
  itemsNumber: number = 10;
  showPagination: boolean = true;

  auditBatch = [
    {
      batchCode: 'batch/0098',
      auditDate: '5th March',
      auditor: 'Aditi',
      status: 'completed',
      auditCount: 2,
      location: 'Delhi',
      candidateDetails: [],
    }
  ]

  updationForm: FormGroup = new FormGroup({});

  constructor(private router: Router,
    private _getDataService: GetdataService,
    private _registerService: RegisterService,
    private _toastrService: ToastrService,
    private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.initializeListType();
    this.getCases();
    this.formBuilder.group({});
  }

  get updationform(): { [key: string]: AbstractControl } {
    return this.updationForm.controls;
  }


  onSubmit($event:any) {
  
    const id = $event.submitter.id;
    const training_date = this.updationForm.value[`training_date${id}`];
    const trainer = this.updationForm.value[`trainer${id}`];
    const venue = this.updationForm.value[`venue${id}`];

    if(training_date == '' || venue == '' || trainer == '') { //all of these 3 are required
      this._toastrService.warning(`${!training_date?'Training Date':''},${!venue?'Venue':''},${!trainer?'Trainer':''}, is Required`)
      return;
    }

    //update the training Batch 
    this._registerService.updateTrainingBatch(id, {training_date, trainer, venue}).subscribe({
      next: res => {

      }
    });

    this.closeEditMode(id);
  }

  toogleTabs(tab: string) {
    this.activeTab = tab;
    this.filterData();
  }

  setServiceType(type: string){
    this.serviceType=type;
    this.filterData();
  }

  onTableDataChange($event:any) {
    this.pageNumber = $event
  }

  getCases(){
    if(this.listType === 'Batch') {
      this._getDataService.getBatchListData().subscribe({
        next: res => {
          this.batchData = res.batches
                          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                          
           this.batchData.forEach((batch: any) => { 
            this.editMode[batch._id] = false;
          });
          this.filterData();
        }
      });
    } else if(this.listType === 'Audit') {
      this.batchData = this.auditBatch;
      console.log(this.batchData);
      this.filterData();
    }
    
  }

  showCaseList(res: any){
    this.router.navigate(['batchlist/caselist'], {state:{batchData: res, forTraining: true}});
  }

  filterData(){
    this.resetEditMode();
    if(this.listType === 'Batch') {
      this.filteredData = this.batchData.filter((item: any) => item.category === this.serviceType && item.location === this.activeTab);
    } else if(this.listType === 'Audit') {
      this.filteredData = this.batchData.filter((item: any) => item.location === this.activeTab);
    }
  }

  openEditMode(id: any, index: number) {
    let selectedBatch = this.batchData.find((item: any) => item._id == id);
    if(selectedBatch.status !== 'completed') {
      return
    }
    this.editMode[id] = true;
    this.updationForm.addControl(`training_date${id}`, this.formBuilder.control(selectedBatch.trainingDate?selectedBatch.trainingDate:''));
    this.updationForm.addControl(`trainer${id}`, this.formBuilder.control(selectedBatch.trainer?selectedBatch.trainer:''));
    this.updationForm.addControl(`venue${id}`, this.formBuilder.control(selectedBatch.venue?selectedBatch.venue:''));
  }

  closeEditMode(id: string) {
    //remove control at last and hide theh form for particular batch
    this.resetEditMode();
    this.updationForm.removeControl(`training_date${id}`);
    this.updationForm.removeControl(`trainer${id}`);
    this.updationForm.removeControl(`venue${id}`);
  }

  getFormatedDate(date: string): string {
    const originalDate = new Date(date);
    const year = originalDate.getFullYear();
    let formattedDate;
    if(Math.floor((new Date().getTime() - originalDate.getTime())/(24*60*60*1000)) < 7){
      formattedDate = days[originalDate.getDay()];
    } else {
      const month = months[originalDate.getMonth()];
      const day = String(originalDate.getDate()).padStart(2, '0');
      formattedDate = `${day}-${month}-${year}`;
    }  
    return formattedDate;
  }

  resetEditMode() {
    const keys: string[] = Object.keys(this.editMode);
    keys.forEach((key: string) => {
      this.editMode[key] = false;
    });
  }

  initializeListType(): void{
    const user = this._registerService.LoggedInUserData();
    const parsedUser = JSON.parse((user as string));
    const panelType = parsedUser.panel_type;
    console.log(panelType);
    if(panelType === 'FSSAI Trainer Panel' || panelType === 'Fostac Panel') {
      this.listType = 'Batch'
    } else if(panelType === 'HRA Panel') {
      this.listType = 'Audit'
    }
    console.log(this.listType);
  }
}
