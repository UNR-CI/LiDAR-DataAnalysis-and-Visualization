/* Singelton Data Service */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {HttpClient, HttpHeaders } from '@angular/common/http';
import { PCD } from './app.component';

@Injectable({
  providedIn: 'root',
})
export class DataService {

  // Declare variable of type PCD from the PCD array in app.component
  public Data : PCD;

  // Initialize variables for point colors and size
  public colorValue : Number;
  public carColor: Number;
  public pedestrianColor: Number;
  public pointSizeValue: Number = 0.5;

  topicURL : string = 'http://ncar-im-1.rc.unr.edu:31750/topics';
  public selectedTopic : string = 'test15thVirginiaSE';

  constructor(private http: HttpClient) { 
    // Set default values
    this.colorValue = 0xFF0000;
    this.carColor = 0xFF0000;
    this.pedestrianColor = 0xFF0000;
    this.pointSizeValue = 0.5;
  }

  // Function to return initial topic from the backend
  getTopic(): Observable<string[]>{
    return this.http.get<string[]>(this.topicURL)
  }

}
