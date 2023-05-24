import { Directive, ElementRef, OnInit } from '@angular/core';
import { Viewer, Cartesian3, Color, PolygonHierarchy, DataSource, TimeInterval, SampledProperty, VelocityOrientationProperty, HermitePolynomialApproximation, TimeIntervalCollection, JulianDate, PathGraphics, PolylineGlowMaterialProperty, SampledPositionProperty, Fullscreen } from 'cesium';
import { CesiumService } from './cesium.service';
@Directive({
  selector: '[appCesium]'
})
export class CesiumDirective implements OnInit {

  viewer: Viewer = null;
  cesiumService: CesiumService;
  constructor(private el: ElementRef, cesiumService: CesiumService) {
    this.cesiumService = cesiumService;
  }
  class = "hidden";
  ngOnInit(): void {
    this.class = "fullscreen";
    // Create a Cesium viewer
    this.viewer = new Viewer(this.el.nativeElement, { fullscreenButton: false });
    this.cesiumService.setViewer(this.viewer);

    // Create a TimeIntervalCollection
    var timeIntervals = new TimeIntervalCollection();
    var start = JulianDate.fromIso8601("2023-01-01T00:00:00Z");
    var stop = JulianDate.fromIso8601("2023-12-31T23:59:59Z");
    timeIntervals.addInterval(new TimeInterval({
      start: start,
      stop: stop
    }));

    // Create a sample sphere entity with a movement pattern
    var sphereEntity = this.viewer.entities.add({
      name: "Sample Sphere",
      position: Cartesian3.fromDegrees(-119.766, 39.526),
      ellipsoid: {
        radii: new Cartesian3(30000.0, 30000.0, 30000.0),
        fill: true,
        outline: false,
        material: Color.RED.withAlpha(0.5)
      },
      show: true,
      availability: timeIntervals
    });

    // Define a sample path for the sphere to follow
    var path = new PathGraphics({
      leadTime: 0,
      trailTime: 10000,
      width: 2,
      material: new PolylineGlowMaterialProperty({
        glowPower: 0.1,
        color: Color.YELLOW
      })
    });
    // sphereEntity.path = path;

    // Set up a sample position property
    var positionProperty = new SampledPositionProperty();
    positionProperty.addSample(start, Cartesian3.fromDegrees(-119.766, 39.526));
    positionProperty.addSample(JulianDate.addSeconds(start, 20, new JulianDate()), Cartesian3.fromDegrees(-119.762, 39.527));
    positionProperty.addSample(JulianDate.addSeconds(start, 40, new JulianDate()), Cartesian3.fromDegrees(-119.758, 39.526));
    positionProperty.addSample(JulianDate.addSeconds(start, 60, new JulianDate()), Cartesian3.fromDegrees(-119.757, 39.522));
    positionProperty.addSample(JulianDate.addSeconds(start, 80, new JulianDate()), Cartesian3.fromDegrees(-119.758, 39.518));
    positionProperty.addSample(JulianDate.addSeconds(start, 100, new JulianDate()), Cartesian3.fromDegrees(-119.762, 39.515));
    positionProperty.addSample(JulianDate.addSeconds(start, 120, new JulianDate()), Cartesian3.fromDegrees(-119.767, 39.514));
    positionProperty.addSample(JulianDate.addSeconds(start, 140, new JulianDate()), Cartesian3.fromDegrees(-119.771, 39.515));
    positionProperty.addSample(JulianDate.addSeconds(start, 160, new JulianDate()), Cartesian3.fromDegrees(-119.774, 39.519));
    positionProperty.addSample(JulianDate.addSeconds(start, 180, new JulianDate()), Cartesian3.fromDegrees(-119.774, 39.523));
    positionProperty.addSample(JulianDate.addSeconds(start, 200, new JulianDate()), Cartesian3.fromDegrees(-119.771, 39.527));
    positionProperty.addSample(JulianDate.addSeconds(start, 220, new JulianDate()), Cartesian3.fromDegrees(-119.767, 39.53));
    positionProperty.addSample(JulianDate.addSeconds(start, 240, new JulianDate()), Cartesian3.fromDegrees(-119.762, 39.532));
    positionProperty.addSample(JulianDate.addSeconds(start, 260, new JulianDate()), Cartesian3.fromDegrees(-119.758, 39.532));
    positionProperty.addSample(JulianDate.addSeconds(start, 280, new JulianDate()), Cartesian3.fromDegrees(-119.753, 39.53));
    positionProperty.addSample(JulianDate.addSeconds(start, 300, new JulianDate()), Cartesian3.fromDegrees(-119.749, 39.527));
    positionProperty.addSample(JulianDate.addSeconds(start, 320, new JulianDate()), Cartesian3.fromDegrees(-119.746, 39.523));
    positionProperty.addSample(JulianDate.addSeconds(start, 340, new JulianDate()), Cartesian3.fromDegrees(-119.746, 39.519));
    positionProperty.addSample(JulianDate.addSeconds(start, 360, new JulianDate()), Cartesian3.fromDegrees(-119.749, 39.515));
    positionProperty.addSample(JulianDate.addSeconds(start, 380, new JulianDate()), Cartesian3.fromDegrees(-119.753, 39.512));
    positionProperty.addSample(JulianDate.addSeconds(start, 400, new JulianDate()), Cartesian3.fromDegrees(-119.758, 39.511));
    positionProperty.addSample(JulianDate.addSeconds(start, 420, new JulianDate()), Cartesian3.fromDegrees(-119.762, 39.512));
    positionProperty.addSample(JulianDate.addSeconds(start, 440, new JulianDate()), Cartesian3.fromDegrees(-119.767, 39.515));
    positionProperty.addSample(JulianDate.addSeconds(start, 460, new JulianDate()), Cartesian3.fromDegrees(-119.771, 39.518));
    positionProperty.addSample(JulianDate.addSeconds(start, 480, new JulianDate()), Cartesian3.fromDegrees(-119.774, 39.522));
    positionProperty.addSample(JulianDate.addSeconds(start, 500, new JulianDate()), Cartesian3.fromDegrees(-119.774, 39.526));
    positionProperty.setInterpolationOptions({
      interpolationDegree: 2,
      interpolationAlgorithm: HermitePolynomialApproximation
    });

    // Set the sphere's position property
    sphereEntity.position = positionProperty;

    // Set the sphere's orientation property to face the direction of motion
    sphereEntity.orientation = new VelocityOrientationProperty(positionProperty);

    // Set the sphere's movement pattern using a TimeIntervalCollection
    var pattern = new SampledProperty(Cartesian3);
    pattern.addSample(start, Cartesian3.fromDegrees(-119.771, 39.527));
    pattern.addSample(JulianDate.addSeconds(start, 200, new JulianDate()), Cartesian3.fromDegrees(-119.767, 39.53));
    pattern.addSample(JulianDate.addSeconds(start, 400, new JulianDate()), Cartesian3.fromDegrees(-119.767, 39.523));
    pattern.addSample(JulianDate.addSeconds(start, 600, new JulianDate()), Cartesian3.fromDegrees(-119.771, 39.527));
    var timeIntervals = new TimeIntervalCollection();
    timeIntervals.addInterval(new TimeInterval({
      start: start,
      stop: JulianDate.addSeconds(start, 600, new JulianDate())
    }));
    //sphereEntity.position.setInterpolationOptions({
    //interpolationDegree: 2,
    //interpolationAlgorithm: HermitePolynomialApproximation
    //});
    //sphereEntity.position.setSamples(pattern, timeIntervals);
    //sphereEntity.position.
    // Set the sphere's appearance
    //sphereEntity.billboard = {
    //image: './path/to/image.png',
    //scale: 0.5
    //};

    // Add the sphere entity to the scene
    //viewer.entities.add(sphereEntity);

    // Fly the camera to the sphere's initial position
    this.viewer.camera.flyTo({
      destination: positionProperty.getValue(start),
      duration: 3
    });

    this.viewer.timeline.zoomTo(start, JulianDate.addSeconds(start, 600, new JulianDate()));
    this.viewer.clock.currentTime = start;

  }

}
