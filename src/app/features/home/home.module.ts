import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HomeComponent } from './pages/home/home.component';
import { ContactProfileComponent } from './pages/contact-profile/contact-profile.component';
import { AddContactComponent } from './pages/add-contact/add-contact.component';
import { HomeRoutingModule } from './home-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [HomeComponent, AddContactComponent, ContactProfileComponent],
  imports: [
    FormsModule,
    CommonModule,
    IonicModule,
    HomeRoutingModule,
    ReactiveFormsModule,
    SharedModule,
]
})
export class HomeModule { }
