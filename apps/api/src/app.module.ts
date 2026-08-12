import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";
import { DatabaseModule } from "./db/database.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { FormsModule } from "./forms/forms.module";
import { TrackingModule } from "./tracking/tracking.module";
import { SubscriptionsModule } from "./subscriptions/subscriptions.module";

@Module({
  imports: [
    ThrottlerModule.forRoot({ throttlers: [{ ttl: 60000, limit: 100 }] }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    FormsModule,
    TrackingModule,
    SubscriptionsModule,
  ],
})
export class AppModule {}
