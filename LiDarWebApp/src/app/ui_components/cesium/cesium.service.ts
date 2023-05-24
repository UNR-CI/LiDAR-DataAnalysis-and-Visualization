import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { createDecoderModule, draco } from 'draco3d';
import { Viewer, Cartesian3, Color, PolygonHierarchy, DataSource, TimeInterval, SampledProperty, VelocityOrientationProperty, HermitePolynomialApproximation, TimeIntervalCollection, JulianDate, PathGraphics, PolylineGlowMaterialProperty, SampledPositionProperty, Fullscreen } from 'cesium';

@Injectable({
  providedIn: 'root',
})
export class CesiumService {

  decoder: any;
  decoderModule: any;
  client: HttpClient;

  viewer: Viewer = null;
  constructor(private http: HttpClient) {

  }

  setViewer(view: Viewer) {
    this.viewer = view;

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

  addEntity(longitude:number,latitude:number,size:number){
    var sphereEntity = this.viewer.entities.add({
      name: "Added Sphere",
      position: Cartesian3.fromDegrees(longitude, latitude),
      ellipsoid: {
        radii: new Cartesian3(size, size, size),
        fill: true,
        outline: false,
        material: Color.RED.withAlpha(0.5)
      },
      show: true
    });
    this.viewer.camera.flyTo({destination:Cartesian3.fromDegrees(longitude, latitude)});
  };


}