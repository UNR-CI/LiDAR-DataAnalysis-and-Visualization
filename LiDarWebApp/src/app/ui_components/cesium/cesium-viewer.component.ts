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
    // http://localhost:5000/trajectoryinfo?limit=10&classtype=1 32141
    this.httpClient.get('http://134.197.75.31:32141/trajectories?limit=100&classtype=0').subscribe((response: any) => { 
      //console.log(response[0]); 
      var min = null;
      for(let i=0; i<response.length; i++) {
        console.log(response[i]);
        console.log(response[i].longitude,response[i].latitude);
        console.log(response[i].frametime);
        if(response[i].longitude == null || response[i].latitude == null) continue;
        if(min == null)
          min = JulianDate.fromIso8601(response[i].frametime);
        else if (JulianDate.lessThan(JulianDate.fromIso8601(response[i].frametime),min))
          min = JulianDate.fromIso8601(response[i].frametime);
        console.log(JulianDate.fromIso8601(response[i].frametime));

        var start = JulianDate.fromIso8601(response[i].frametime);
        var end = JulianDate.addSeconds(start, 1000, new JulianDate());
        //this.cesiumService.addEntity(response[i].longitude,response[i].latitude, .1,start,end);
        
        this.cesiumService.addBoundingBox(response[i].classtype,response[i].longitude,response[i].latitude,1,response[i].dir_x_bbox,response[i].dir_y_bbox,response[i].width,response[i].length,response[i].height, response[i].direction, start,end);
      }
      var clock = this.cesiumService.viewer.clock;
      console.log('min')
      console.log(min);
      clock.currentTime = min;
      clock.multiplier = 0;
    });
    console.log(this.range.controls.start.value, this.range.controls.end.value);
  }
}
