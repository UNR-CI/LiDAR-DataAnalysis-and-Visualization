/* Settings Page Component.
  Sets initial variables for color and size selection */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '@app/data.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  // Init selected variables
  selectedColor: string;
  selectedCarColor: string;
  selectedPedColor: string;
  selectedPointSize: Number = .5;

  // Init default variables
  colors: string[] = ['Red (Default)', 'Green', 'Blue'];
  color: Number;
  color2: string = "rgb(0,0,255)";
  colorCar: string = "rgb(0,0,255)";
  colorPed: string = "rgb(0,0,255)";
  colorFormat: string = 'rgb'
  colorMap: Map<string, number> = new Map<string, number>([
    ["Red (Default)", 0xFF0000 ],
    ["Green", 0x00FF00 ],
    ["Blue", 0x0000FF ]
  ]);

  constructor(private router: Router, private ds: DataService) { }

  ngOnInit(): void {
    // Initializes selections to default values
    this.color2 = numberToHex(this.ds.colorValue);
    console.log(this.color2);
    this.colorCar = numberToHex(this.ds.carColor);
    this.colorPed = numberToHex(this.ds.pedestrianColor);
    //this.selectedColor = this.colors[0];
    this.selectedPointSize = this.ds.pointSizeValue;
  }

  // Function to set color picker value
  colorPicker(value: string) {
    this.selectedColor = value;
    this.color2 = numberToHex(this.colorMap.get(this.selectedColor));
    console.log("test");
  }

  // Button to set changes to scene
  setChanges() {
    console.log("Settings Updated");
    console.log(parseInt(this.color2.substr(1)));
    console.log(hexToNumber(this.color2));

    this.ds.colorValue = hexToNumber(this.color2);//this.color;//this.colorMap.get(this.selectedColor);
    this.ds.carColor = hexToNumber(this.colorCar);
    this.ds.pedestrianColor = hexToNumber(this.colorPed);
    this.ds.pointSizeValue = this.selectedPointSize;
    this.router.navigateByUrl('/visualizations');
  }

  // Button to cancel changes and revert back to default values
  clickCancel() {
    console.log("Changes Cancelled");
    // Route back to settings page and reset the page
    this.router.navigateByUrl('/settings').then(() => { 
      window.location.reload(); 
    });;
  }
}

// Function that converts number value into equivalent hex string
let numberToHex = function (value) {
   var r = (value >> 16 & 0xFF).toString(16);
   var g = ((value >> 8) & 0xFF).toString(16);
   var b = (value & 0xFF).toString(16);
   if(r.length == 1)
   {
    r = '0' + r;
   }
   if(g.length == 1)
   {
    g = '0' + g;
   }
   if(b.length == 1)
   {
    b = '0' + b;
   }
   console.log(value);
   return '#'+r+g+b;
}

// Function that converts hex string into rgb number
let hexToRgb = function (hexValue){
  var rgbResult = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexValue);
  return rgbResult ? {
    r: parseInt(rgbResult[1], 16),
    g: parseInt(rgbResult[2], 16),
    b: parseInt(rgbResult[3], 16)
  }:null;}

// Function takes in hex string, passes value to hexToRgb(), and returns number values
let hexToNumber = function(hexValue) {
  let value = hexToRgb(hexValue);
  return (value.r << 16 )+ (value.g << 8) + value.b; 
  
}

