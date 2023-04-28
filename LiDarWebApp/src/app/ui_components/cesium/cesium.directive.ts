import { Directive, ElementRef, OnInit } from '@angular/core';
import { Viewer,Cartesian3,Color, PolygonHierarchy, DataSource} from 'cesium';

@Directive({
  selector: '[appCesium]'
})
export class CesiumDirective implements OnInit {
  

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    console.log('here in now yall');
    const viewer = new Viewer(this.el.nativeElement);
    const positions = Cartesian3.fromDegreesArray([
      -109.080842, 45.002073, -105.91517, 45.002073, -104.058488, 44.996596,
      -104.053011, 43.002989, -104.053011, 41.003906, -105.728954, 40.998429,
      -107.919731, 41.003906, -109.04798, 40.998429, -111.047063, 40.998429,
      -111.047063, 42.000709, -111.047063, 44.476286, -111.05254, 45.002073,
    ]);
    const wyoming = viewer.entities.add({
      polygon: {
        hierarchy: new PolygonHierarchy(positions),
        height: 0,
        material: Color.RED.withAlpha(0.5),
        outline: true,
        outlineColor: Color.BLACK,
      },
    });
    const position = Cartesian3.fromDegrees(
      -123.0744619,
      44.0503706,
      10.0
    );
    const entity = viewer.entities.add({
      name: "assets/bunny.drc",
      position: position,
      //orientation: orientation,
      model: {
        uri: "assets/bunny.drc",
        minimumPixelSize: 128,
        maximumScale: 20000,
      },
    });
    viewer.trackedEntity = entity;
    console.log(entity);
    viewer.zoomTo(entity);

    /*const renoPosition = Cartesian3.fromDegrees(-119.814, 39.529);
    viewer.entities.add({
      position: renoPosition,
      ellipsoid: {
        radii: new Cartesian3(5000.0, 5000.0, 5000.0),
        material: Color.YELLOW
      }
    });

    // Add a red sphere at the center of Sparks, Nevada 60 seconds later
    setTimeout(() => {
      const sparksPosition = Cartesian3.fromDegrees(-119.7539, 39.5349);
      const entity = viewer.entities.add({
        position: sparksPosition,
        ellipsoid: {
          radii: new Cartesian3(5000.0, 5000.0, 5000.0),
          material: Color.RED
        }
      });
      viewer.zoomTo(entity);
    }, 10000);*/
  }

}
