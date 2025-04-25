import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule } from "@angular/forms"
import { RegisterComponent } from "./pages/register/register.component"
import { LoginComponent } from "./pages/login/login.component"
import { AuthRoutingModule } from "./auth-routing.module"
import { IonicModule } from "@ionic/angular"
import { SharedModule } from "../../shared/shared.module"

@NgModule({
  declarations: [RegisterComponent, LoginComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AuthRoutingModule,
    IonicModule,
    SharedModule,
  ],
})
export class AuthModule {}
