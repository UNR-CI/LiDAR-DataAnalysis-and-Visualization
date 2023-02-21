/* Module that imports libraries and various created components into main Angular application */ 
/* Angular Library Components */
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';

/* Added Libraries */
import { AppRoutingModule } from './app-routing.module';
import { MdbCheckboxModule } from 'mdb-angular-ui-kit/checkbox';
import { MqttSocketService } from './mqtt/mqttsocket.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ColorPickerModule } from 'ngx-color-picker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/* Created Components including UI and Renderer */
import { AppComponent } from './app.component';
import { HeaderComponent } from './ui_components/header/header.component';
import { FooterComponent } from './ui_components/footer/footer.component';
import { RendererComponent } from './renderer/renderer.component';
import { AppMaterialModule } from "./app-material.module";
import { HomeComponent } from './ui_components/home/home.component';
import { AboutComponent } from './ui_components/about/about.component';
import { DataFormComponent } from './ui_components/data-form/data-form.component';
import { SettingsComponent } from './ui_components/settings/settings.component';
import { VisualizationsComponent } from './ui_components/visualizations/visualizations.component';
import { ChartsComponent } from './ui_components/charts/charts.component';
import {
  IMqttMessage,
  MqttModule,
  IMqttServiceOptions
} from 'ngx-mqtt';


const config: IMqttServiceOptions = {
  connectOnCreate: true,
  hostname: '134.197.75.31',
  port: 30042,
  path: '/mqtt'
};

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    RendererComponent,
    HomeComponent,
    AboutComponent,
    DataFormComponent,
    SettingsComponent,
    VisualizationsComponent,
    ChartsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FlexLayoutModule,
    MdbCheckboxModule,
    FormsModule, 
    ReactiveFormsModule,
    AppMaterialModule,
    BrowserAnimationsModule,
    NgxChartsModule,
    ColorPickerModule,
    MatProgressSpinnerModule,
    MqttModule.forRoot(config)
  ],
  providers: [MqttSocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }
