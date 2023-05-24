import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { CesiumService } from './cesium.service';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-cesium-viewer',
  /*template: '<div appCesium></div>',*/
  templateUrl: './cesium-viewer.component.html',
  styleUrls: ['./cesium-viewer.component.css']
})
export class CesiumViewerComponent {
  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
  //cesiumService: CesiumService;
  constructor(private cesiumService: CesiumService, private httpClient: HttpClient) {
    //this.cesiumService = cesiumService;
  }
  click() {
    this.cesiumService.addExampleEntity();
    this.httpClient.get('http://localhost:5000/trajectory').subscribe((response: any) => { 
      //console.log(response[0]); 
      for(let i=0; i<response.length; i++) {
        console.log(response[i].longitude,response[i].latitude);
        this.cesiumService.addEntity(response[i].longitude,response[i].latitude, .1);
      }
    });
    console.log(this.range.controls.start.value, this.range.controls.end.value);
  }
}
