import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {HttpClient, HttpHeaders } from '@angular/common/http';
import { PCD } from '../app.component';
import {createDecoderModule,draco} from 'draco3d';

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
  providedIn: 'root',
})
export class DracoService {

  decoder: any;
  decoderModule : any;

  constructor(private http: HttpClient) { 
    var self = this;
    createDecoderModule({}).then(function(module) {
        // This is reached when everything is ready, and you can call methods on
        // Module.
        self.decoderModule = module;
        console.log('Decoder Module Initialized!');
        self.decoder = new self.decoderModule.Decoder();
        console.log(self.decoder);
      });
  }
  
  converData(bytes : Uint8Array) : PCD {
    let data : PCD;
    let x = [];
    let y = [];
    let z = [];
    let intensity = [];
    if(this.decoder) {
        //console.log("here now yall 2");
        //console.log(this.decoder);
        //const buffer = new self.decoder.DecoderBuffer();
        //let utf8Encode = new TextEncoder();

        //buffer.Init(new Int8Array(bytes), bytes.byteLength);
        //console.log(self.decoder.GetEncodedGeoemtryType(buffer) == self.decoder.POINT_CLOUD);
        let dracoGeometry = new this.decoderModule.PointCloud();
        let decodingStatus = this.decoder.DecodeArrayToPointCloud(bytes, bytes.length, dracoGeometry);
        if(decodingStatus.ok()) {
          /*console.log(dracoGeometry);
          console.log(dracoGeometry.num_points());
          console.log(dracoGeometry.num_attributes());
          console.log(this.decoder.GetAttributeId(dracoGeometry,this.decoderModule.GENERIC,0));
          console.log('---------------------');*/
          for (var i = 0; i < dracoGeometry.num_attributes(); i++ ) {
            let attr = this.decoder.GetAttribute(dracoGeometry, i);
            /*console.log(attr.attribute_type());
            console.log(attr.data_type());*/
            switch(attr.data_type()) {
              case DracoDataType.DT_FLOAT32:
                var numPoints = dracoGeometry.num_points() * attr.num_components();
                var dataSize = numPoints * 4;
                var ptr = this.decoderModule._malloc( dataSize );
                this.decoder.GetAttributeDataArrayForAllPoints(dracoGeometry, attr, this.decoderModule.DT_FLOAT32, dataSize, ptr);
                let array : Float32Array = new Float32Array( this.decoderModule.HEAPF32.buffer, ptr, numPoints ).slice();
                this.decoderModule._free(ptr);
                array.forEach((element,index) =>{
                    if(index % 3 == 0) {
                        x.push(element);
                    }
                    if(index % 3 == 1) {
                        y.push(element);
                    }
                    if(index % 3 == 2) {
                        z.push(element);
                    }
                });
                //console.log(array);
  
              break;
              case DracoDataType.DT_UINT8:
                var numPoints = dracoGeometry.num_points() * attr.num_components();
                var dataSize = numPoints;
                var ptr = this.decoderModule._malloc( dataSize );
                this.decoder.GetAttributeDataArrayForAllPoints(dracoGeometry, attr, this.decoderModule.DT_UINT8, dataSize, ptr);
                let array2 : Uint8Array = new Uint8Array( this.decoderModule.HEAPF32.buffer, ptr, numPoints ).slice();
                array2.forEach((element,index) => {
                        intensity.push(element);
                });
                this.decoderModule._free(ptr);
                //console.log(array2);
              break;
              case DracoDataType.DT_UINT16:
                var numPoints = dracoGeometry.num_points() * attr.num_components();
                var dataSize = numPoints*2;
                var ptr = this.decoderModule._malloc( dataSize );
                this.decoder.GetAttributeDataArrayForAllPoints(dracoGeometry, attr, this.decoderModule.DT_UINT16, dataSize, ptr);
                var array3 = new Uint16Array( this.decoderModule.HEAPF32.buffer, ptr, numPoints ).slice();
                this.decoderModule._free(ptr);
                //console.log(array3);
              break;
            }
            //console.log(attr.num_components());
            //console.log('aaaaaaaaaaa');
          }
          this.decoderModule.destroy(dracoGeometry);
        }
    }
    data = {x:x,y:y,z:z,intensity:intensity,time:'',topic:'',objects:[]};
    return data;
  }
}