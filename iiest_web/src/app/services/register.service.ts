import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Employee, fbo, loginEmployee} from '../utils/registerinterface';
import { Observable, throwError} from 'rxjs';
import { map} from 'rxjs/operators';
import { catchError} from 'rxjs/operators'
import { config } from '../utils/config'
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  msg: string = "Hello Welcome";
  url = config.API_URL
  constructor(private http: HttpClient, private router:Router) { }

  /*public saveUser(user: User): Observable<any> {
    const url = 'https://reqres.in/api/users';
    return this.http.post<any>(url, user);
  }*/

  public addEmployee(addemployee: Employee): Observable<any> {
    const url = `${this.url}/empregister`
    return this.http.post<any>(url, addemployee).pipe(
      catchError(
        this.handleError
      ));
  }
  
  public addFbo(addFbo: fbo): Observable<any> {
    const url = `${this.url}/fboregister`
    return this.http.post<any>(url, addFbo).pipe(
      catchError(
        this.handleError
      ));
  }

  public loginEmployee(loginemployee: loginEmployee): Observable<any> {
    const url = `${this.url}/login`;
    return this.http.post<any>(url, loginemployee).pipe(catchError(this.handleError));
  } 
  
  public deleteFbo(id: string, deletedBy: string): Observable<any> {
    const url = `${this.url}/deleteFbo/${id}`;
    return this.http.delete<any>(url, {body: {deletedBy}}).pipe(catchError(this.handleError));
  } 

  public deleteEmployee(id: string, deletedBy: string): Observable<any> {
    const url = `${this.url}/deleteEmployee/${id}`;
    return this.http.delete<any>(url, {body: {deletedBy}}).pipe(catchError(this.handleError));
  } 

  public updateEmployee(objId: string, employee: Employee, editedBy: string): Observable<any>{
    const url = `${this.url}/editEmployee/${objId}`;
    return this.http.put<any>(url, {...employee, editedBy}).pipe(catchError(this.handleError));
  }


  private handleError(err: HttpErrorResponse): Observable<never> {
    // just a test ... more could would go here
    return throwError(() => err);
  }

  storeToken(currentUser:any){
    localStorage.setItem('issLoggedIn', 'true')
    localStorage.setItem('token', currentUser.authToken)
    localStorage.setItem("LoggedInUser", JSON.stringify(currentUser.employee_user));
    
  }

  getToken(){
    return localStorage.getItem('token')
  }
  LoggedInUserData(){
    return localStorage.getItem('LoggedInUser')
  }

  isLoggedIn(){
    return !!localStorage.getItem('token')
  }
  signout(){
    localStorage.clear();
    this.router.navigate([''])
  }
}
