/* MQTT Socket Service Class.
  Uses socketio library to connect to Flask backend
  through websokcets to pull in data. */
import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs/internal/Observable';
import {Subscription} from 'rxjs';


import {createDecoderModule,draco} from 'draco3d';
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

export enum DracoDataType {
  DT_INVALID = 0,
  DT_INT8,
  DT_UINT8,
  DT_INT16,
  DT_UINT16,
  DT_INT32,
  DT_UINT32,
  DT_INT64,
  DT_UINT64,
  DT_FLOAT32,
  DT_FLOAT64,
  DT_BOOL
};

// These values must be exactly the same as the values in
// geometry_attribute.h.
// Attribute type.
export enum DracoAttributeType {
  INVALID = -1,
  POSITION = 0,
  NORMAL,
  COLOR,
  TEX_COORD,
  // A special id used to mark attributes that are not assigned to any known
  // predefined use case. Such attributes are often used for a shader specific
  // data.
  GENERIC
};


@Injectable({
 providedIn: 'root'
})



//Class that connects to Flask App through websockets and emits MQTT messages
export class MqttSocketService extends Socket {
 client:MqttService;
 subscription: Subscription;
 decoder: any;
 decoderModule : any;
 constructor(private _mqttService: MqttService) {
  
   super({url: 'http://ncar-im-1.rc.unr.edu:31750', options: {  withCredentials: false} 
   //, transport : ['websocket']}
   });

   let self = this;
   this.client = _mqttService;
   createDecoderModule({}).then(function(module) {
    // This is reached when everything is ready, and you can call methods on
    // Module.
    self.decoderModule = module;
    console.log('Decoder Module Initialized!');
    self.decoder = new self.decoderModule.Decoder();
    console.log(self.decoder);
  });
   
   this.client.connect(config);
   
   this.subscription = this.client.observe('/IM/9th/62/NE').subscribe((message: IMqttMessage) => {
    console.log(message.payload.toString());
    var json = JSON.parse(message.payload.toString());
    console.log("here now yall");
    //let file = Base64Binary.decode(json.file);
    let file = Uint8Array.from(window.atob(json.file), (v) => v.charCodeAt(0))
    
    if(self.decoder) {
      console.log("here now yall 2");
      console.log(self.decoder);
      //const buffer = new self.decoder.DecoderBuffer();
      //let utf8Encode = new TextEncoder();
      let bytes = file;//utf8Encode.encode(file);
      //buffer.Init(new Int8Array(bytes), bytes.byteLength);
      //console.log(self.decoder.GetEncodedGeoemtryType(buffer) == self.decoder.POINT_CLOUD);
      let dracoGeometry = new self.decoderModule.PointCloud();
      let decodingStatus = self.decoder.DecodeArrayToPointCloud(bytes,bytes.length, dracoGeometry);
      if(decodingStatus.ok()) {
        console.log(dracoGeometry);
        console.log(dracoGeometry.num_points());
        console.log(dracoGeometry.num_attributes());
        console.log(self.decoder.GetAttributeId(dracoGeometry,self.decoderModule.GENERIC,0));
        console.log('---------------------');

        for (var i = 0; i < dracoGeometry.num_attributes(); i++ ) {
          let attr = self.decoder.GetAttribute(dracoGeometry, i);
          console.log(attr.attribute_type());
          console.log(attr.data_type());
          switch(attr.data_type()) {
            case DracoDataType.DT_FLOAT32:
              var numPoints = dracoGeometry.num_points() * attr.num_components();
              var dataSize = numPoints * 4;
              var ptr = self.decoderModule._malloc( dataSize );
              self.decoder.GetAttributeDataArrayForAllPoints(dracoGeometry, attr, self.decoderModule.DT_FLOAT32, dataSize, ptr);
              var array = new Float32Array( self.decoderModule.HEAPF32.buffer, ptr, numPoints ).slice();
              self.decoderModule._free(ptr);
              console.log(array);

            break;
            case DracoDataType.DT_UINT8:
              var numPoints = dracoGeometry.num_points() * attr.num_components();
              var dataSize = numPoints;
              var ptr = self.decoderModule._malloc( dataSize );
              self.decoder.GetAttributeDataArrayForAllPoints(dracoGeometry, attr, self.decoderModule.DT_UINT8, dataSize, ptr);
              var array2 = new Uint8Array( self.decoderModule.HEAPF32.buffer, ptr, numPoints ).slice();
              self.decoderModule._free(ptr);
              console.log(array2);
            break;
            case DracoDataType.DT_UINT16:
              var numPoints = dracoGeometry.num_points() * attr.num_components();
              var dataSize = numPoints*2;
              var ptr = self.decoderModule._malloc( dataSize );
              self.decoder.GetAttributeDataArrayForAllPoints(dracoGeometry, attr, self.decoderModule.DT_UINT16, dataSize, ptr);
              var array3 = new Uint16Array( self.decoderModule.HEAPF32.buffer, ptr, numPoints ).slice();
              self.decoderModule._free(ptr);
              console.log(array3);
            break;
          }
          console.log(attr.num_components());
          console.log('aaaaaaaaaaa');
        }
        self.decoderModule.destroy(dracoGeometry);
      }
      //console.log(test);
    }
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
