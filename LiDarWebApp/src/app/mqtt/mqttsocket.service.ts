/* MQTT Socket Service Class.
  Uses socketio library to connect to Flask backend
  through websokcets to pull in data. */
import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription, Observer,of, Subject} from 'rxjs';
import { DracoService } from '@app/draco/draco.service';

import {
  IMqttMessage,
  IMqttServiceOptions,
  MqttService,
  IPublishOptions
 } from 'ngx-mqtt';
import { IClientSubscribeOptions } from 'mqtt-browser';
import { PCD } from '@app/app.component';


const config: IMqttServiceOptions = {
  connectOnCreate: true,
  hostname: 'ncar-da-1.rc.unr.edu',
  port: 443,
  path: '/mqtt',
  protocol: 'wss'
};

@Injectable({
 providedIn: 'root'
})

//Class that connects to Flask App through websockets and emits MQTT messages
export class MqttSocketService extends Socket {
 client:MqttService;
 dracoProcess:DracoService;
 subscription: Subscription;
 testSubject:Subject<PCD>;
 dataList:PCD[] = [];
 constructor(private _mqttService: MqttService, private _draco:DracoService) {
  
   super({url: 'http://ncar-im-1.rc.unr.edu:31750', options: {  withCredentials: false} 
   //, transport : ['websocket']}
   });
   let self = this;

   this.testSubject = new Subject<PCD>();
   this.client = _mqttService;
   this.dracoProcess = _draco;   
   this.client.connect(config);
   

 }

 public dispatch(messageType: string, payload: any) {
   this.emit(messageType, payload);
 }

 public subscribeToMessage(messageType: string): Observable<any> {
   return this.fromEvent(messageType);
 }
 
 public subscribe(topic) {
  if(this.subscription) {
    this.subscription.unsubscribe();
  }
  this.subscription = this.client.observe(topic).subscribe((message: IMqttMessage) => {
    //console.log('here yall');
    
    //self.dispatch('mqtt_message', '');
    //console.log(message.payload.toString());
    var json = JSON.parse(message.payload.toString());
    //console.log(json);
    //console.log('time',json.time);
    //console.log("here now yall");
    //let file = Base64Binary.decode(json.file);
    let file = Uint8Array.from(window.atob(json.file), (v) => v.charCodeAt(0));
    //self.dataList.push(this.dracoProcess.converData(file));
    var pcd = this.dracoProcess.converData(file);
    //console.log(pcd);
    pcd.topic = message.topic;
    pcd.time = json.timestamp;
    pcd.objects = json.objects;
    this.testSubject.next(pcd);
   });
 };

 public ngOnDestroy() {
  this.subscription.unsubscribe();
  }
}
