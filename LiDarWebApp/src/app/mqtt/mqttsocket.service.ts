/* MQTT Socket Service Class.
  Uses socketio library to connect to Flask backend
  through websokcets to pull in data. */
import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription, Observer,of, Subject} from 'rxjs';

import {
  IMqttMessage,
  IMqttServiceOptions,
  MqttService,
  IPublishOptions
 } from 'ngx-mqtt';
import { IClientSubscribeOptions } from 'mqtt-browser';
import { PCD } from '@app/app.component';
import { topicList } from '@app/env';

const config: IMqttServiceOptions = {
  connectOnCreate: true,
  hostname: 'ncar-da-1.rc.unr.edu',
  port: 443,
  path: '/mqtt',
  protocol: 'wss'
};

export interface SubscriptionInterface {
  [index: string]: Subscription;
}

export interface SubjectInterface {
  [index: string]: Subject<PCD>;
}

@Injectable({
 providedIn: 'root'
})


//Class that connects to Flask App through websockets and emits MQTT messages
export class MqttSocketService {
 client:MqttService;
 subscription: Subscription;

 subscriptions: SubscriptionInterface = {};
 testSubject: Subject<PCD>;
 subjects: SubjectInterface = {};
 subscribedState: Record<string,boolean>;
 dataList:PCD[] = [];
 constructor(private _mqttService: MqttService) {
   let self = this;
   this.testSubject = new Subject<PCD>();
   this.client = _mqttService;
   this.client.connect(config);
   for (var topic in topicList) {
    this.subjects[topicList[topic]] = new Subject<PCD>();
   }

 }
 
 public subscribe(topic) {

  if( topic in this.subscriptions && this.subscriptions[topic]) {
    this.subscriptions[topic].unsubscribe();
  }
  this.subscriptions[topic] = this.client.observe(topic).subscribe((message: IMqttMessage) => {
    if(!message.payload) return;
    var json = JSON.parse(message.payload.toString());
    let file = Uint8Array.from(window.atob(json.file), (v) => v.charCodeAt(0));
    var pcd = new PCD;
    pcd.topic = message.topic;
    pcd.time = json.timestamp;
    pcd.objects = json.objects;
    pcd.payload = file;
    this.subjects[topic].next(pcd);
   });
 };

 public isSubscribed(topic) : boolean { 
  return this.subscriptions[topic] != null && !this.subscriptions[topic].closed; //this.subscriptions.has(topic) && !this.subscriptions[topic].closed;
 }

 public unsubscribe(topic) {
  if (topic in this.subscriptions) {
    this.subscriptions[topic].unsubscribe();
    delete this.subscriptions[topic];
  }
 }

 public ngOnDestroy() {
  console.log("here destroy");
  
  for (var topic in topicList) {
    if(this.subscriptions[topic]) this.subscriptions[topic].unsubscribe();
   }
  }
}
