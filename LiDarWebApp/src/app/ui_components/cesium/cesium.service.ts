import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { createDecoderModule, draco } from 'draco3d';
import { ConstantProperty,Transforms, HeadingPitchRoll,Viewer, Cartesian3, Color, BoxGeometry, PolygonHierarchy, DataSource, TimeInterval, SampledProperty, VelocityOrientationProperty, HermitePolynomialApproximation, TimeIntervalCollection, JulianDate, PathGraphics, PolylineGlowMaterialProperty, SampledPositionProperty, Fullscreen, Spherical, AxisAlignedBoundingBox, Math as math } from 'cesium';
import { NonNullableFormBuilder } from '@angular/forms';
import { getType } from '@angular/flex-layout/extended/style/style-transforms';

@Injectable({
  providedIn: 'root',
})
export class CesiumService {

  decoder: any;
  decoderModule: any;
  client: HttpClient;

  viewer: Viewer = null;

  valueToColorMap:Map<number, Color> = new Map<number, Color>([[0,Color.RED],[1,Color.BLACK],[2,Color.GREEN],[3,Color.BLUE],[4,Color.YELLOW],[5,Color.ORANGE]]);



  constructor(private http: HttpClient) {

  }

  setViewer(view: Viewer) {
    this.viewer = view;

  }

  getCesiumCamera() {
    return this.viewer.camera;
  }

  addExampleEntity() {
    var sphereEntity = this.viewer.entities.add({
      name: "Sample Sphere",
      position: Cartesian3.fromDegrees(-119.766, 39.526),
      ellipsoid: {
        radii: new Cartesian3(30000.0, 30000.0, 30000.0),
        fill: true,
        outline: false,
        material: Color.RED.withAlpha(0.5)
      },
      show: true
    });
  }

  addEntity(longitude:number,latitude:number,size:number,startTime:JulianDate=null,endTime:JulianDate=null){
    var timeIntervals = new TimeIntervalCollection();
    if (startTime != null) {
      timeIntervals.addInterval(new TimeInterval({
        start: startTime,
        stop: endTime
      }));
    }


    var sphereEntity = this.viewer.entities.add({
      name: "Added Sphere",
      position: Cartesian3.fromDegrees(longitude, latitude),
      ellipsoid: {
        radii: new Cartesian3(size, size, size),
        fill: true,
        outline: false,
        material: Color.RED.withAlpha(0.5)
      },
      show: true//,
      //availability: timeIntervals
    });
    this.viewer.camera.flyTo({destination:Cartesian3.fromDegrees(longitude, latitude)});
    
    return sphereEntity;
  };

  addBoundingBox(classType:number,longitude:number,latitude:number,size:number,dir_x_bbox:number,dir_y_bbox:number, width:number, length:number, height:number, angle:number, startTime:JulianDate=null,endTime:JulianDate=null){
    var timeIntervals = new TimeIntervalCollection();
    if (startTime != null) {
      timeIntervals.addInterval(new TimeInterval({
        start: startTime,
        stop: endTime
      }));
    }
    var point = Cartesian3.fromDegrees(longitude, latitude);
    Spherical.fromCartesian3
    var maxCorner = point.clone();
    var minCorner = point.clone();
    maxCorner.x += dir_x_bbox * 20;
    maxCorner.y += dir_y_bbox * 20;
    minCorner.x -= dir_x_bbox * 20;
    minCorner.y -= dir_y_bbox * 20;
    console.log(width);
    console.log(height);
    console.log(point);
    console.log('point');
    
    var geometry = BoxGeometry.fromAxisAlignedBoundingBox( new AxisAlignedBoundingBox(minCorner,maxCorner));
    //geometry.options.material = Color.BLUE;
    // we need an orientation
    console.log('angle',angle);
    console.log('whl',width,height,length);
    var hpr = new HeadingPitchRoll(math.toRadians(angle),0,0);

    const orientation2 = new ConstantProperty(Transforms.headingPitchRollQuaternion(point,hpr));

    var entity = this.viewer.entities.add({name: 'Test', orientation: orientation2, box: { dimensions: new Cartesian3(width,length,height), 
      material: this.valueToColorMap.get(classType) }, position: point, show: true,      
      //availability: timeIntervals
    });
    /*var sphereEntity = this.viewer.entities.add({
      name: "Added Sphere",
      position: Cartesian3.fromDegrees(longitude, latitude),
      ellipsoid: {
        radii: new Cartesian3(size, size, size),
        fill: true,
        outline: false,
        material: Color.RED.withAlpha(0.5)
      },
      show: true,
      availability: timeIntervals
    });*/
    this.viewer.camera.flyTo({destination:Cartesian3.fromDegrees(longitude, latitude)});
    
    return entity;
  };

  hideEverything() {
    this.viewer.scene.globe.show = false;
    this.viewer.entities.values.forEach(entity => {
      entity.show = false;
    });
  }

  showEverything() {
    this.viewer.scene.globe.show = true;
    this.viewer.entities.values.forEach(entity => {
      entity.show = true;
    });
  }


}