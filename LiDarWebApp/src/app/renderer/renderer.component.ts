/**************************************************************************
 * Renderer Component
 * Author: Andrew Munoz
 * Date: June 2021
 * Purpose: Renders the 3D point cloud mesh. Takes in data from the
 * singleton DataService and uses the three.js library to render the
 * points within a scene.
 *************************************************************************/

import { AfterViewInit, Component,  Input, ViewChild, ElementRef, ContentChild, NgZone } from '@angular/core';
import { DataService } from '../data.service';
import { Color, WebGLRenderer, PerspectiveCamera, BoxGeometry, BufferGeometry, Float32BufferAttribute, Points,
  PointsMaterial, MeshBasicMaterial, Mesh, Scene } from 'three';
import { OrbitControls } from '@avatsaev/three-orbitcontrols-ts';
import * as STATS from 'stats-js';
import { Observable, Subscription } from 'rxjs';
import { MqttService } from 'ngx-mqtt';
import { PCD } from '@app/app.component';
import { MqttSocketService } from '@app/mqtt/mqttsocket.service';
import { DracoService } from '@app/draco/draco.service';
import { SimpleChanges } from '@angular/core';
@Component
({
  selector: 'three-renderer',
  template: '<canvas #canvas></canvas>'
})

// Main Class
export class RendererComponent implements AfterViewInit {
  @Input() topic: string;
  @Input() active: string;
  private pcdScene: Scene;
  private pcamera: PerspectiveCamera;
  private pcdPoints: Points;
  public renderer: WebGLRenderer;
  public controls: OrbitControls;
  subscription : Subscription;
  dracoProcess:DracoService;
  ms : MqttSocketService;
  @ViewChild( 'canvas' ) canvasReference: ElementRef;
  pointCloud : PCD;
  get canvas(): HTMLCanvasElement { return this.canvasReference.nativeElement; }

  // Constructor builds three scene and camera
  constructor( private ds: DataService, readonly zone: NgZone, ms: MqttSocketService, private _draco:DracoService ) {
    this.pcdScene = new Scene();
    this.pcamera = new PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    this.ms = ms;
    this.dracoProcess = _draco;
    console.log('inited!');

  }

  ngOnInit(): void {
    //this.ms.subscribe(this.topic);
    var self = this;
    if(this.ms && this.topic in this.ms.subjects)
    {
      this.subscription = this.ms.subjects[this.topic].subscribe({ next: (value) => {self.process(value)}});
    }
  }
  process(value): void {
    var data = this.dracoProcess.convertData(value.payload);
    this.pointCloud = {time: value.time, topic: value.topic, x: data.x, 
      y: data.y, z: data.z, intensity: data.intensity, 
      objects: value.objects, payload: null};
  }

  @Input() color: string | number | Color = 0x000000;
  @Input() alpha = 0;
  onPage : boolean = false;
  // Main Function that implements on Init
  ngAfterViewInit()
  {
    this.onPage = true;
    console.log('init called');
    // Create Stats variable to run and show fps of app in upper left corner
    var stats = new STATS();
    var showStats = false; // Needs to be switched to true to make panel show in if statement below

    // Conditional to show stats panel in upper left corner of browser window
    if(showStats) {
      stats.showPanel( 1 );
      document.body.appendChild( stats.dom );
    }

    // Create three elements 
    var geometry = new BufferGeometry();
    var positions = new Array(80000 * 3);
    var colors = new Array(80000 * 3);
    for (var index = 0; index < 80000 * 3; index++) {
      positions[index] = 0;
      colors[index] = 0;
    }
    
    if ( positions.length > 0 ) geometry.setAttribute( 'position', new Float32BufferAttribute( positions, 3 ) );
    if ( colors.length > 0 ) geometry.setAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

    // Set three material, points, scene and camera elements to default values
    var material = new PointsMaterial( { size: this.ds.pointSizeValue, color: 0xffffff, vertexColors: true });
    this.pcdPoints = new Points( geometry, material );
    this.pcdScene.add( this.pcdPoints );
    this.pcdScene.background = new Color(0x000000);

    this.pcamera.updateProjectionMatrix();
    this.pcamera.position.set(0, -25, 0);
    this.pcamera.lookAt( this.pcdScene.position );

    // Set three renderer and controls
    this.renderer = new WebGLRenderer( { canvas: this.canvas, antialias: true, alpha: true } ); // render
    this.renderer.setPixelRatio( devicePixelRatio );
    this.renderer.setClearColor( this.color, this.alpha );
    this.renderer.setSize( window.innerWidth/2, window.innerHeight/2 );
    this.renderer.autoClear = true;

    this.controls = new OrbitControls( this.pcamera, this.canvas );
    this.controls.autoRotate = false;
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
    this.controls.update();

    // Reset Camera position after controls update
    this.pcamera.position.x = 0;
    this.pcamera.position.z = 30;
    var self = this;
    // Function runs animate outside of Angular to not overload the app
    this.zone.runOutsideAngular( _ => 
    {
      const animate = () =>
      {
        
        if (self.onPage && self.active != 'off') {
          if(!self.ms.isSubscribed(self.topic)) {
            self.ms.subscribe(self.topic);
          } 
          this.renderer.clear();
          
          stats.begin();

          if(this.pointCloud) {
            this.updateBuffer();
          }

          this.controls.update();
          this.render();
          stats.end();
        } else {
          self.ms.unsubscribe(self.topic);
        } 
        if(this.onPage)
        requestAnimationFrame( animate );
      };    
        animate();
    } )
  }

  // Function that updates the position and color of the points
  updateBuffer() { 
    var vertices = [];
    var vertX = this.pointCloud['x'];
    var vertY = this.pointCloud['y'];
    var vertZ = this.pointCloud['z'];
    var boundBox = this.pointCloud['objects'];
    var intensity = this.pointCloud['intensity'];
    const colorPicked = new Color(this.ds.colorValue); // Color for entire scene
    const carColorP = new Color(this.ds.carColor); // Color for Cars
    const pedColorP = new Color(this.ds.pedestrianColor); // Color for Pedestrians
    const positions = this.pcdPoints.geometry.attributes.position.array;
    const colors = this.pcdPoints.geometry.attributes.color.array;

    for ( var i=0; i < vertX.length; i++ ){
      this.pcdPoints.geometry.attributes.position.setXYZ(i, vertX[i], vertY[i], vertZ[i]);
      this.pcdPoints.geometry.attributes.color.setXYZ(i, colorPicked.r, colorPicked.g, colorPicked.b);
      
      // Additional Loop to check for cars and pedestrians to set/change color of each
      for( var j=0; j < boundBox.length; j++) {
        if(boundBox[j]['minx'] < vertX[i] && boundBox[j]['maxx'] > vertX[i] 
          && boundBox[j]['miny'] < vertY[i] && boundBox[j]['maxy'] > vertY[i] 
          && boundBox[j]['minz'] < vertZ[i] && boundBox[j]['maxz'] > vertZ[i]) {

          let xsize = this.pointCloud.objects[j].maxx - this.pointCloud.objects[j].minx;
          let ysize = this.pointCloud.objects[j].maxy - this.pointCloud.objects[j].miny;
          let zsize = this.pointCloud.objects[j].maxz - this.pointCloud.objects[j].minz;

          let volume = xsize * ysize * zsize;

          // Average volume of pedestrian
          if(volume > 0.1) {
            this.pcdPoints.geometry.attributes.color.setXYZ(i, carColorP.r, carColorP.g, carColorP.b);
          }
          else {
            this.pcdPoints.geometry.attributes.color.setXYZ(i, pedColorP.r, pedColorP.g, pedColorP.b);
          }
        }
      }
    }

    this.pcdPoints.geometry.attributes.position.needsUpdate = true;
    this.pcdPoints.geometry.attributes.color.needsUpdate = true;
    this.pcdPoints.geometry.setDrawRange(0, vertX.length);
    this.pcdPoints.geometry.computeBoundingSphere();
  }

  // Call to render function which renders the main scene
  render() { 
      this.renderer.render( this.pcdScene, this.pcamera ); 
  }

  ngOnChanges(changes: SimpleChanges) {
    var self = this;
    console.log(changes.topic.currentValue);  
    if(this.subscription)
    {
      this.subscription.unsubscribe();
    }
    if(this.ms && changes.topic.currentValue in this.ms.subjects)
    {
      this.ms.subscribe(changes.topic.currentValue);
      this.ms.unsubscribe(changes.topic.previousValue);
      this.subscription = this.ms.subjects[changes.topic.currentValue].subscribe({ next: (value) => {self.process(value)}});
    }
  }


  public ngOnDestroy() {
    console.log('on destroy called');
    this.onPage = false;
    this.subscription.unsubscribe();
    //this.ms.testSubject.unsubscribe();
  }

  submit(){
    console.log("Data Explorer Form Submitted");
    //this.ds.selectedTopic = this.explorerForm.value.topic;
    //this.ms.subscribe(this.explorerForm.value.topic);
    //this.router.navigateByUrl('/visualizations');
  }
}
