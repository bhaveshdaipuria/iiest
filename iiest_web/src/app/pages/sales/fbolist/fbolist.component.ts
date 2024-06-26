import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { GetdataService } from 'src/app/services/getdata.service';
import { RegisterService } from 'src/app/services/register.service';
import { faEye, faPencil, faTrash, faEnvelope, faXmark, faMagnifyingGlass, faFileCsv, faFilePdf, faIndianRupeeSign, faArrowUp, faArrowDown, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { ExportAsService, ExportAsConfig } from 'ngx-export-as';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RecipientComponent } from 'src/app/pages/modals/recipient/recipient.component';
import { ViewFboComponent } from 'src/app/pages/modals/view-fbo/view-fbo.component';

@Component({
  selector: 'app-fbolist',
  templateUrl: './fbolist.component.html',
  styleUrls: ['./fbolist.component.scss']
})
export class FbolistComponent implements OnInit {
  @Output() isEditRecord = new EventEmitter();

  createdBy: any;
  allFBOEntries: any;
  filteredFBOEntries: any;
  selectedFilter: string = 'byFboName';
  searchQuery: string = '';
  filteredData: any;
  isSearch: boolean = false;
  faEye: IconDefinition = faEye;
  faPencil: IconDefinition = faPencil;
  faTrash: IconDefinition = faTrash;
  faEnvelope: IconDefinition = faEnvelope;
  faXmark: IconDefinition = faXmark;
  faFileCsv: IconDefinition = faFileCsv;
  faFilePdf: IconDefinition = faFilePdf;
  faArrowUp: IconDefinition = faArrowUp;
  faArrowDown: IconDefinition = faArrowDown;
  faIndianRupeeSign: IconDefinition = faIndianRupeeSign;
  faMagnifyingGlass: IconDefinition = faMagnifyingGlass;
  pageNumber: number = 1;
  itemsNumber: number = 25;

  activeTab: string = 'Fostac';


  isModal: boolean = false;

  //loading
  loading: boolean = true;

  constructor(private getDataService: GetdataService,
    private registerService: RegisterService,
    private exportAsService: ExportAsService,
    private modalService: NgbModal) { }

  ngOnInit(): void {
    this.fetchAllFboData();
  }

  fetchAllFboData(): void {
    this.getDataService.getSalesList().subscribe({
      next: (res) => {
        if (res.salesInfo) {
          this.allFBOEntries = res.salesInfo.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((elem: any, index: number) => ({ ...elem, serialNumber: index + 1 }));
          this.filteredFBOEntries = this.allFBOEntries.filter((item: any) => {
            if (item.product_name.includes(this.activeTab)) {
              return item;
            }
          });
          this.filter();
          this.loading = false;
        }
      },
      error: (err) => {
        let errorObj = err;
        if (errorObj.userError) {
          this.registerService.signout();
        }
      }
    })
  }

  filter(): void {
    if (!this.searchQuery) {
      this.filteredData = this.filteredFBOEntries;
    } else {
      switch (this.selectedFilter) {
        case 'byOwner': this.filteredData = this.filteredFBOEntries.filter((elem: any) => elem.fboInfo.owner_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
          break;
        case 'byLocation': this.filteredData = this.filteredFBOEntries.filter((elem: any) => (elem.fboInfo.district.toLowerCase().includes(this.searchQuery.toLowerCase()) || elem.fboInfo.state.toLowerCase().includes(this.searchQuery.toLowerCase())));
          break;
        case 'byFboName': this.filteredData = this.filteredFBOEntries.filter((elem: any) => elem.fboInfo.fbo_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
          break;
        case 'byCustomerID': this.filteredData = this.filteredFBOEntries.filter((elem: any) => elem.fboInfo.customer_id.includes(this.searchQuery))
          break;
        case 'byProduct': this.filteredData = this.filteredFBOEntries.filter((elem: any) => {
          if (elem.fboInfo.product_name.find((product: string) => product.toLowerCase().includes(this.searchQuery))) {
            return true;
          } else {
            return false;
          }
        });
          break;
      }
    }
  }

  onSearchChange(): void {
    this.pageNumber = 1;
    this.isSearch = true;
    this.filter();
  }

  onTableDataChange(event: any) {
    this.pageNumber = event;
    this.filter();
  }

  onItemNumChange() {
    this.pageNumber = 1;
  }

  //Edit Mode Emitter to Parent component fbo
  editRecord(res: any): void {
    var data = {
      isEditMode: true,
      Record: res
    }
    this.isEditRecord.emit(data);
  }

  deleteFBO(fbo: any): void {
    const loggedInUserData: any = this.registerService.LoggedInUserData();
    const parsedData = JSON.parse(loggedInUserData);
    const deletedBy = parsedData.employee_id;
    this.registerService.deleteFbo(fbo._id, deletedBy).subscribe({
      next: (res) => {
        if (res.success) {
          const index = this.allFBOEntries.findIndex((entry: any) => entry._id === fbo._id);
          if (index !== -1) {
            this.allFBOEntries.splice(index, 1);
            this.filter();
          }
        }
      },
      error: (err) => {
        let errorObj = err;
        if (errorObj.userError) {
          this.registerService.signout();
        }
      }
    });
  }

  //Export To CSV
  exportToCsv(): void {
    const options: ExportAsConfig = {
      type: 'csv',
      elementIdOrContent: 'data-to-export',
    };

    this.exportAsService.save(options, 'table_data').subscribe(() => {
    });
  }

  //Recipient Add
  recipient(res: any, serviceType: string) {
    if (res !== '' && serviceType === 'fostac') {
      const modalRef = this.modalService.open(RecipientComponent, { size: 'lg', backdrop: 'static' });
      modalRef.componentInstance.fboData = res;
      modalRef.componentInstance.serviceType = serviceType;
    } else {
      const modalRef = this.modalService.open(RecipientComponent, { size: 'lg', backdrop: 'static' });
      modalRef.componentInstance.fboData = res;
      modalRef.componentInstance.serviceType = serviceType;
    }
  }

  //View FBO Details
  viewFboDetails(res: any) {
    const modalRef = this.modalService.open(ViewFboComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.fboData = res;
  }


  toogleTabs(tab: string) {
    this.activeTab = tab;
    this.pageNumber = 1;

    this.filteredFBOEntries = this.allFBOEntries.filter((item: any) => {
      if (item.product_name.includes(tab)) {
        return item;
      }
    });
    this.filter();

  }

  getFormattedSalesDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    let suffix = "";
    if (day === 1 || day === 21 || day === 31) {
      suffix = "st";
    } else if (day === 2 || day === 22) {
      suffix = "nd";
    } else if (day === 3 || day === 23) {
      suffix = "rd";
    } else {
      suffix = "th";
    }
    return `${day}${suffix} ${month} ${year}`;
  }

     // Method to calculate the processing amount for each row
  calculateProcessingAmount(employee: any): number {
    let processingAmount = 0;


    if (employee.product_name) {
      // Calculate processing amount based on the product name
      employee.product_name.forEach((product: any) => {

        if (product == "Fostac") {
          processingAmount += employee.fostacInfo.fostac_processing_amount * employee.fostacInfo.recipient_no;
        }
        if (product == "Foscos") {
          let watertest = 0;
          if (employee.foscosInfo.water_test_fee != 0) {
            watertest = employee.foscosInfo.water_test_fee - 1200;
          }

          processingAmount += (employee.foscosInfo.foscos_processing_amount * employee.foscosInfo.shops_no) + watertest;
        }
        if (product == "HRA") {
          processingAmount += employee.hraInfo.hra_processing_amount * employee.hraInfo.shops_no;
        }
      });
    }

    return processingAmount;
  }

  calculateFoscosProcessingAmount(employee: any): number {
    let processingAmount = 0;


    if (employee.product_name) {
      // Calculate processing amount based on the product name
      employee.product_name.forEach((product: any) => {
        if (product == "Foscos") {
          let watertest = 0;
          if (employee.foscosInfo.water_test_fee != 0) {
            watertest = employee.foscosInfo.water_test_fee - 1200;
          }

          processingAmount += (employee.foscosInfo.foscos_processing_amount * employee.foscosInfo.shops_no) + watertest;
        }
      });
    }

    return processingAmount;
  }

  
}
