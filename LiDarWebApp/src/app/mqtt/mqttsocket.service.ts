/* MQTT Socket Service Class.
  Uses socketio library to connect to Flask backend
  through websokcets to pull in data. */
import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs/internal/Observable';
import {Subscription} from 'rxjs';

import {
  IMqttMessage,
  IMqttServiceOptions,
  MqttService,
  IPublishOptions
 } from 'ngx-mqtt';
import { IClientSubscribeOptions } from 'mqtt-browser';


const config: IMqttServiceOptions = {
  connectOnCreate: true,
  hostname: '134.197.75.31',
  port: 30042,
  path: '/mqtt'
};


@Injectable({
 providedIn: 'root'
})

//Class that connects to Flask App through websockets and emits MQTT messages
export class MqttSocketService extends Socket {
 client:MqttService;
 subscription: Subscription;

 constructor(private _mqttService: MqttService) {
   super({url: 'http://ncar-im-1.rc.unr.edu:31750', options: {  withCredentials: false} 
   //, transport : ['websocket']}
   });
   this.client = _mqttService;
   this.client.connect(config);
   this.subscription = this.client.observe('/IM/9th/62/NE').subscribe((message: IMqttMessage) => {
    console.log(message.payload.toString());
   });
 }

 public dispatch(messageType: string, payload: any) {
   this.emit(messageType, payload);
 }

 public subscribeToMessage(messageType: string): Observable<any> {
   return this.fromEvent(messageType);
 }

 public ngOnDestroy() {
  this.subscription.unsubscribe();
}
}
