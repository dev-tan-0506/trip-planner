"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const trips_module_1 = require("./trips/trips.module");
const auth_module_1 = require("./auth/auth.module");
const itinerary_module_1 = require("./itinerary/itinerary.module");
const proposals_module_1 = require("./proposals/proposals.module");
const votes_module_1 = require("./votes/votes.module");
const templates_module_1 = require("./templates/templates.module");
const logistics_module_1 = require("./logistics/logistics.module");
const checklists_module_1 = require("./checklists/checklists.module");
const attendance_module_1 = require("./attendance/attendance.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '../../.env',
            }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            trips_module_1.TripsModule,
            itinerary_module_1.ItineraryModule,
            proposals_module_1.ProposalsModule,
            votes_module_1.VotesModule,
            templates_module_1.TemplatesModule,
            logistics_module_1.LogisticsModule,
            checklists_module_1.ChecklistsModule,
            attendance_module_1.AttendanceModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map