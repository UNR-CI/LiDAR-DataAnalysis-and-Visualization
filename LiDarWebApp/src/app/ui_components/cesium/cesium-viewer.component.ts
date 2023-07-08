import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { CesiumService } from './cesium.service';
import { HttpClient } from '@angular/common/http';
import { JulianDate } from 'cesium';
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
    this.httpClient.get('http://localhost:5000/trajectoryinfo').subscribe((response: any) => { 
      //console.log(response[0]); 
      for(let i=0; i<response.length; i++) {
        console.log(response[i].longitude,response[i].latitude);
        console.log(response[i].frametime);
        console.log(JulianDate.fromIso8601(response[i].frametime));
        var clock = this.cesiumService.viewer.clock;
        clock.currentTime = JulianDate.fromIso8601(response[i].frametime);
        clock.multiplier = 0;
        var start = JulianDate.fromIso8601(response[i].frametime);
        var end = JulianDate.addSeconds(start, 1, new JulianDate());
        //this.cesiumService.addEntity(response[i].longitude,response[i].latitude, .1,start,end);

        this.cesiumService.addBoundingBox(response[i].longitude,response[i].latitude,1,response[i].dir_x_bbox,response[i].dir_y_bbox,response[i].width,response[i].length,response[i].height,start,end);
      }
    });
    console.log(this.range.controls.start.value, this.range.controls.end.value);
  }
}
