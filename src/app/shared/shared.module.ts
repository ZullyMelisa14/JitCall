import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { IonicModule } from "@ionic/angular"
import { IncomingCallComponent } from "./components/incomingCall/IncomingCall.component"
import { EmptyScreenComponent } from "./components/empty-screen/empty-screen.component"
import { CallButtonComponent } from "./components/call-button/call-button.component"
import { CallHistoryComponent } from "./components/call-history/call-history.component"
import { HeaderComponent } from "./components/header/header.component"
import { NotificationToastComponent } from "./components/notification-toast/notification-toast.component"
import { UAvatarComponent } from "./components/u-avatar/avatar.component"
import { CCardComponent } from "./components/ccontact/contact.component"

const COMPONENTS = [
  IncomingCallComponent,
  UAvatarComponent,
  CCardComponent,
  EmptyScreenComponent,
  HeaderComponent,
  CallButtonComponent,
  CallHistoryComponent,
  NotificationToastComponent,
]

@NgModule({
  declarations: [...COMPONENTS],
  imports: [CommonModule, IonicModule],
  exports: [...COMPONENTS],
})
export class SharedModule {}
