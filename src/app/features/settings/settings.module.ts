import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { IonicModule } from "@ionic/angular"
import { ReactiveFormsModule } from "@angular/forms"
import { SettingsRoutingModule } from "./settings-routing.module"
import { PlatformRegistrationComponent } from "./pages/platform-registration/platform-registration.component"
import { SharedModule } from "../../shared/shared.module" // Importamos el SharedModule

@NgModule({
  declarations: [PlatformRegistrationComponent],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    SettingsRoutingModule,
    SharedModule,
  ],
})
export class SettingsModule {}
