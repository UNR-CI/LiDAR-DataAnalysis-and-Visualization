/**************************************************************************
 * Renderer Component
 * Author: Andrew Munoz
 * Date: June 2021
 * Purpose: Renders the 3D point cloud mesh. Takes in data from the
 * singleton DataService and uses the three.js library to render the
 * points within a scene.
 *************************************************************************/

import { AfterViewInit, Component, Input, ViewChild, ElementRef, ContentChild, NgZone } from '@angular/core';
import { DataService } from '../data.service';
import {
  Color, WebGLRenderer, PerspectiveCamera, BoxGeometry, BufferGeometry, Float32BufferAttribute, Points,
  PointsMaterial, MeshBasicMaterial, Mesh, Scene, SphereGeometry, Vector3
} from 'three';
import { OrbitControls } from '@avatsaev/three-orbitcontrols-ts';
import * as STATS from 'stats-js';
import { Observable, Subscription } from 'rxjs';
import { MqttService } from 'ngx-mqtt';
import { PCD } from '@app/app.component';
import { MqttSocketService } from '@app/mqtt/mqttsocket.service';
import { DracoService } from '@app/draco/draco.service';
import { SimpleChanges } from '@angular/core';
import { CesiumService } from '@app/ui_components/cesium/cesium.service';
import {  Math,PerspectiveFrustum,Cartographic } from 'cesium';
//import * as  UTMLatLng  from 'utm-latlng-orabazu';
var utmObj = require('utm-latlng-orabazu');
//UTMLatLng

@Component
  ({
    selector: 'three-renderer',
    template: '<div><canvas #canvas ></canvas></div>'
  })

// Main Class
export class RendererComponent implements AfterViewInit {
  @Input() topic: string;
  @Input() topic2: string;
  @Input() active: string;
  private pcdScene: Scene;
  private pcamera: PerspectiveCamera;
  private pcdPoints: Points;
  private pcdPointsArray: { [key: string]: Points };
  public renderer: WebGLRenderer;
  public controls: OrbitControls;
  private sphere: Mesh[];
  private utmConvert:any = new utmObj();
  newTopicFirst:boolean = false;
  newTopicSecond:boolean = false;
  subscriptions: { [key: string]: Subscription };
  dracoProcess: DracoService;
  ms: MqttSocketService;
  @ViewChild('canvas') canvasReference: ElementRef;
  pointCloud: PCD;
  private pointClouds: { [key: string]: PCD };
  get canvas(): HTMLCanvasElement { return this.canvasReference.nativeElement; }

  // Constructor builds three scene and camera
  constructor(private ds: DataService, readonly zone: NgZone, ms: MqttSocketService, private _draco: DracoService, private _cesiumService:CesiumService) {
    this.pcdScene = new Scene();
    
    this.pcamera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000000);
    this.ms = ms;
    this.dracoProcess = _draco;
    console.log('inited!');

  }

  ngOnInit(): void {
    //this.ms.subscribe(this.topic);
    var self = this;
    self.pointClouds = {};
    self.pcdPointsArray = {};
    self.subscriptions = {};
  }
  process(value): void {
    var data = this.dracoProcess.convertData(value.payload);
    //this.pointCloud = {
    //  time: value.time, topic: value.topic, x: data.x,
    //  y: data.y, z: data.z, intensity: data.intensity,
    //  objects: value.objects, payload: null, latitude: value.latitude, longitude: value.longitude, forwarddirection: value.forwarddirection
    //};
    console.log(value.topic);
    this.pointClouds[value.topic] = {
      time: value.time, topic: value.topic, x: data.x,
      y: data.y, z: data.z, intensity: data.intensity,
      objects: value.objects, payload: null, latitude: value.latitude, longitude: value.longitude, forwarddirection: value.forwarddirection
    };
  }

  @Input() color: string | number | Color = 0x000000;
  @Input() alpha = 0;
  onPage: boolean = false;
  // Main Function that implements on Init
  ngAfterViewInit() {
    this.onPage = true;
    console.log('init called');
    // Create Stats variable to run and show fps of app in upper left corner
    var stats = new STATS();
    var showStats = false; // Needs to be switched to true to make panel show in if statement below

    // Conditional to show stats panel in upper left corner of browser window
    if (showStats) {
      stats.showPanel(1);
      document.body.appendChild(stats.dom);
    }
    // Set three renderer and controls
    this.renderer = new WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true }); // render
    this.renderer.setPixelRatio(devicePixelRatio);
    //this.renderer.setClearColor(0xffffff, 0);
    this.renderer.setSize(window.innerWidth , window.innerHeight);
    this.renderer.autoClear = true;

    // Create three elements 
    this.sphere = [];
    var sphereGeometry = new SphereGeometry(100, 32, 16);
    var sphereMaterial = new MeshBasicMaterial({ color: 0xffff00 });
    var sphere = new Mesh(sphereGeometry, sphereMaterial);
    var camera = this._cesiumService.getCesiumCamera();
    
    var displacement = Cartographic.fromDegrees(-119.81854309810514,39.5438915231015);
    //4039062.5175966527
    var position = Cartographic.toCartesian(displacement);
    console.log(displacement);
    console.log(position);
    //position.z = 4035728.60582164;
    sphere.position.set(position.x,position.y,position.z);
    //camera.worldToCameraCoordinates()
    //sphere.position.set(-2445899.5048352405, -4276740.309637379, 4037498.5638592127);

    this.sphere.push(sphere);

    var sphereMaterial = new MeshBasicMaterial({ color: 0xffffff });
    sphere = new Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(3, 0, 0);
    this.sphere.push(sphere);

    var sphereMaterial = new MeshBasicMaterial({ color: 0x00ffff });
    sphere = new Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(0, 3, 0);
    this.sphere.push(sphere);

    var geometry = new BufferGeometry();
    var positions = new Array(80000 * 3);
    var colors = new Array(80000 * 3);
    for (var index = 0; index < 80000 * 3; index++) {
      positions[index] = 0;
      colors[index] = 0;
    }

    if (positions.length > 0) geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    if (colors.length > 0) geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));

    // Set three material, points, scene and camera elements to default values
    var material = new PointsMaterial({ size: this.ds.pointSizeValue, color: 0xffffff, vertexColors: true });
    this.pcdPoints = new Points(geometry, material);
    this.pcdScene.add(this.pcdPoints);
    //this.sphere.needsUpdate = true;
    this.sphere.forEach((sphere) => { this.pcdScene.add(sphere); })



    //this.pcdScene.background = null;


    //this.pcamera.updateProjectionMatrix();
    //Easting: 257759.0015798236, Northing: 5619067.676596848
    
    //this.pcamera.position.set(257759.0015798236, 5619067.676596848-25, 0);
    //this.pcamera.lookAt(0,0,0);
    //this.pcamera.updateMatrix();
    //this.pcamera.updateProjectionMatrix();

    //this.controls = new OrbitControls(this.pcamera, this.canvas);
    //this.controls.autoRotate = false;
    //this.controls.enableZoom = true;
    //this.controls.enablePan = true;
    //this.controls.target.set(257759.00158, 4380932.3234,0);
    //this.controls.update();

    //this.pcamera.position.set(257759.00158, 4380932.3234,25);
    //this.controls.update();

    //this.pcamera.position.set(0,0,25);
    //this.controls.target.set(0,0,0);
    //this.controls.update();



    // Reset Camera position after controls update
    //this.pcamera.position.x = 0;
    //this.pcamera.position.z = 30;
    var self = this;
    // Function runs animate outside of Angular to not overload the app
    this.zone.runOutsideAngular(_ => {
      const animate = () => {

        if (self.onPage && self.active != 'off') {
          if (!self.ms.isSubscribed(self.topic)) {
            self.ms.subscribe(self.topic);
          }
          this.renderer.clear();

          stats.begin();

          //if (this.pointClouds.key) { 


          var camera = this._cesiumService.getCesiumCamera()
          this.pcamera.fov = Math.toDegrees((camera.frustum as PerspectiveFrustum).fovy) // ThreeJS FOV is vertical
          this.pcamera.updateProjectionMatrix();
          var cvm = camera.viewMatrix;
          var civm = camera.inverseViewMatrix;
          this.pcamera.position.set(camera.position.x,camera.position.y,camera.position.z)
          console.log(camera.position);
          //console.log(cvm)
          //console.log(civm);
          this.pcamera.matrixAutoUpdate = false;
          this.pcamera.matrixWorld.set(
            civm[0], civm[4], civm[8 ], civm[12],
            civm[1], civm[5], civm[9 ], civm[13],
            civm[2], civm[6], civm[10], civm[14],
            civm[3], civm[7], civm[11], civm[15]
          );
          this.pcamera.matrixWorldInverse.set(
            cvm[0], cvm[4], cvm[8 ], cvm[12],
            cvm[1], cvm[5], cvm[9 ], cvm[13],
            cvm[2], cvm[6], cvm[10], cvm[14],
            cvm[3], cvm[7], cvm[11], cvm[15]
          );

          //this.pcamera.up.set(camera.up.x,camera.up.y,camera.up.z);

          //this.pcamera.lookAt(new Vector3(0,0,0));
          //this.pcamera.updateMatrix()
          
          //this.pcamera.matrix.set(camera.transform[0],camera.transform[1],camera.transform[2],camera.transform[3],
          //  camera.transform[4],camera.transform[5],camera.transform[6],camera.transform[7],
          //  camera.transform[8],camera.transform[9],camera.transform[10],camera.transform[11],
          //  camera.transform[12],camera.transform[13],camera.transform[14],camera.transform[15]);
          //console.log(this.pcamera.position);
          //camera.c
          //console.log(camera.worldToCameraCoordinatesPoint(this.pcamera.position));
          //this.sphere[0].position
          //this.updateBuffer();
          //this.controls.update();
          var displacement = Cartographic.fromDegrees(-119.81854309810514,39.5438915231015);
          var position = Cartographic.toCartesian(displacement);
          console.log(4035728.60582164,this.sphere[0].position,position);

          //}

          
          this.render();
          stats.end();
        } else {
          self.ms.unsubscribe(self.topic);
        }
        if (this.onPage)
          requestAnimationFrame(animate);
      };
      animate();
    })
  }

  addPointCloud(topic) {
    var geometry = new BufferGeometry();
    var positions = new Array(80000 * 3);
    var colors = new Array(80000 * 3);
    for (var index = 0; index < 80000 * 3; index++) {
      positions[index] = 0;
      colors[index] = 0;
    }

    if (positions.length > 0) geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    if (colors.length > 0) geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));

    // Set three material, points, scene and camera elements to default values
    var material = new PointsMaterial({ size: this.ds.pointSizeValue, color: 0xffffff, vertexColors: true });
    this.pcdPointsArray[topic] = new Points(geometry, material);
    this.pcdScene.add(this.pcdPointsArray[topic]);
  }

  updatePointCloud(topic) {
    if (topic in this.pointClouds) {
      
      var pointCloud = this.pointClouds[topic];
      var pcdPoints = this.pcdPointsArray[topic];
      var vertices = [];
      var latitude = parseFloat(pointCloud['latitude']);
      if (pointCloud['latitude'].indexOf('S') > -1)
      {
        latitude = -latitude;
      }
      var longitude = parseFloat(pointCloud['longitude']);
      if (pointCloud['longitude'].indexOf('W') > -1)
      {
        longitude = - longitude;
      }
      console.log(latitude,longitude);
      
      var utm = this.utmConvert.convertLatLngToUtm(latitude,longitude,5);
      console.log(utm);
      var vertX = pointCloud['x'];
      var vertY = pointCloud['y'];
      var vertZ = pointCloud['z'];
      var boundBox = pointCloud['objects'];
      var intensity = pointCloud['intensity'];
      const colorPicked = new Color(this.ds.colorValue); // Color for entire scene
      const carColorP = new Color(this.ds.carColor); // Color for Cars
      const pedColorP = new Color(this.ds.pedestrianColor); // Color for Pedestrians

      console.log(pointCloud['forwarddirection']);
      console.log(utm['Easting'],utm['Northing']);
      //257759.0015798236, 5619067.676596848

      pcdPoints.position.set(utm['Easting'],utm['Northing'],0);
      if (pointCloud['forwarddirection']) {
        pcdPoints.rotation.set(0, 0, 3.14 / 180.0 * pointCloud['forwarddirection']);
      }
      pcdPoints.updateMatrix();
      //ConvertLatLngToUtm(1,1,1);
      //this.pcdPoints.rotateZ(3.14 / 2)
      //console.log(vertX);
      //console.log(boundBox);
      if (vertX)
        for (var i = 0; i < vertX.length; i++) {
          pcdPoints.geometry.attributes.position.setXYZ(i, vertX[i], vertY[i], vertZ[i]);
          pcdPoints.geometry.attributes.color.setXYZ(i, colorPicked.r, colorPicked.g, colorPicked.b);

          // Additional Loop to check for cars and pedestrians to set/change color of each
          if (boundBox != null)
            for (var j = 0; j < boundBox.length; j++) {
              if (boundBox[j]['minx'] < vertX[i] && boundBox[j]['maxx'] > vertX[i]
                && boundBox[j]['miny'] < vertY[i] && boundBox[j]['maxy'] > vertY[i]
                && boundBox[j]['minz'] < vertZ[i] && boundBox[j]['maxz'] > vertZ[i]) {

                let xsize = pointCloud.objects[j].maxx - pointCloud.objects[j].minx;
                let ysize = pointCloud.objects[j].maxy - pointCloud.objects[j].miny;
                let zsize = pointCloud.objects[j].maxz - pointCloud.objects[j].minz;

                let volume = xsize * ysize * zsize;

                // Average volume of pedestrian
                if (volume > 0.1) {
                  pcdPoints.geometry.attributes.color.setXYZ(i, carColorP.r, carColorP.g, carColorP.b);
                }
                else {
                  pcdPoints.geometry.attributes.color.setXYZ(i, pedColorP.r, pedColorP.g, pedColorP.b);
                }
              }
            }
        }

      pcdPoints.geometry.attributes.position.needsUpdate = true;
      pcdPoints.geometry.attributes.color.needsUpdate = true;
      pcdPoints.geometry.setDrawRange(0, vertX.length);
      pcdPoints.geometry.computeBoundingSphere();
    }
    //this.sphere.geometry.attributes.position.needsUpdate = true;
    //this.sphere.geometry.attributes.color.needsUpdate = true;
  }

  // Function that updates the position and color of the points
  updateBuffer() {

    this.updatePointCloud(this.topic);
    if(this.topic && this.newTopicFirst)
    { 
      console.log(this.pcdPointsArray[this.topic].position);
      this.pcamera.position.set(this.pcdPointsArray[this.topic].position.x,this.pcdPointsArray[this.topic].position.y,25);
      //this.controls.update();

      //this.controls.target.set(this.pcdPointsArray[this.topic].position.x,this.pcdPointsArray[this.topic].position.y,this.pcdPointsArray[this.topic].position.z);
      //this.controls.update();
      this.newTopicFirst = false;
      
    }

    this.updatePointCloud(this.topic2);
    if(this.topic2 && this.newTopicSecond)
    { 
      this.pcamera.position.set(this.pcdPointsArray[this.topic2].position.x,this.pcdPointsArray[this.topic2].position.y,25);
      //this.controls.update();

      //this.controls.target.set(this.pcdPointsArray[this.topic2].position.x,this.pcdPointsArray[this.topic2].position.y,this.pcdPointsArray[this.topic2].position.z);
     //this.controls.update();
      this.newTopicSecond = false;
    }
  }

  // Call to render function which renders the main scene
  render() {
    this.renderer.render(this.pcdScene, this.pcamera);
  }

  ngOnChanges(changes: SimpleChanges) {
    var self = this;
    //console.log(changes.topic.currentValue);

    if (changes.topic && this.ms && changes.topic.currentValue in this.ms.subjects) {
      if (changes.topic.previousValue in this.subscriptions) {
        this.subscriptions[changes.topic.previousValue].unsubscribe();
        delete this.subscriptions[changes.topic.previousValue];
      }
      this.ms.subscribe(changes.topic.currentValue);
      this.ms.unsubscribe(changes.topic.previousValue);
      this.subscriptions[changes.topic.currentValue] = this.ms.subjects[changes.topic.currentValue].subscribe({ next: (value) => { self.process(value) } });
      this.topic = changes.topic.currentValue;
      this.addPointCloud(changes.topic.currentValue);
      if (changes.topic.previousValue in this.pcdPointsArray) {
        this.pcdScene.remove(this.pcdPointsArray[changes.topic.previousValue]);
      }
      this.newTopicFirst = true;
    }
    if (changes.topic2 && this.ms && changes.topic2.currentValue in this.ms.subjects) {
      if (changes.topic2.previousValue in this.subscriptions) {
        this.subscriptions[changes.topic2.previousValue].unsubscribe();
        delete this.subscriptions[changes.topic2.previousValue];
      }
      this.ms.subscribe(changes.topic2.currentValue);
      this.ms.unsubscribe(changes.topic2.previousValue);
      this.subscriptions[changes.topic2.currentValue] = this.ms.subjects[changes.topic2.currentValue].subscribe({ next: (value) => { self.process(value) } });
      this.topic2 = changes.topic2.currentValue;
      this.addPointCloud(changes.topic2.currentValue);
      if (changes.topic2.previousValue in this.pcdPointsArray) {
        this.pcdScene.remove(this.pcdPointsArray[changes.topic2.previousValue]);
      }
      this.newTopicSecond = true;
    }
  }


  public ngOnDestroy() {
    console.log('on destroy called');
    this.onPage = false;
    for (const key in this.subscriptions) {
      this.subscriptions[key].unsubscribe();
    }


    //this.ms.testSubject.unsubscribe();
  }

  submit() {
    console.log("Data Explorer Form Submitted");
    //this.ds.selectedTopic = this.explorerForm.value.topic;
    //this.ms.subscribe(this.explorerForm.value.topic);
    //this.router.navigateByUrl('/visualizations');
  }
}
