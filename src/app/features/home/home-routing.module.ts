import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ContactProfileComponent } from './pages/contact-profile/contact-profile.component';
import { AddContactComponent } from './pages/add-contact/add-contact.component';
import { AuthGuard } from 'src/app/core/guards/auth.guard';

const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'add-contact', component: AddContactComponent, canActivate: [AuthGuard] },
  { path: 'contact/:id', component: ContactProfileComponent, canActivate: [AuthGuard] },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule {}
