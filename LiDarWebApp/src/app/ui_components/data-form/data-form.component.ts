import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { MqttSocketService } from '@app/mqtt/mqttsocket.service';
import { DataService } from '@app/data.service';

@Component({
  selector: 'app-data-form',
  templateUrl: './data-form.component.html',
  styleUrls: ['./data-form.component.css']
})
export class DataFormComponent implements OnInit {

  // Default Values if no data is coming through from backend
  topicList: any = ['test15thVirginiaSE','test15thVirginiaNW', 'test']
  statList: any = ['Object Count']
  timeSelect: any = ['1','2','3','4']
  vizList: any = ['Line Graph', 'Bar Chart', '3D Point Cloud Render']
  formatList: any = ['.pcd','.pcap', '.gif']
  rangeList: any = ['1','2','3','4']

  // Create the form group and set 
  explorerForm = new FormGroup({
    topic: new FormControl('', [Validators.required, Validators.minLength(3)]),
    stats: new FormControl('', Validators.required),
    time: new FormControl(''),
    visualizationType: new FormControl(''),
    dataFormat: new FormControl(''),
    range: new FormControl('')
  });
  

  constructor(private ds : DataService, private ms : MqttSocketService, private router: Router) { }

  ngOnInit(): void {
    this.ds.getTopic().subscribe(topicList => {this.topicList = topicList});
  }

  get f(){
    return this.explorerForm.controls;
  }
  
  submit(){
    console.log("Data Explorer Form Submitted");
    console.log(this.explorerForm.value.topic);
    this.ds.selectedTopic = this.explorerForm.value.topic;
    this.router.navigateByUrl('/visualizations');
  }


}
