import { ItineraryService } from './itinerary.service';
import { CreateItineraryItemDto } from './dto/create-itinerary-item.dto';
import { UpdateItineraryItemDto } from './dto/update-itinerary-item.dto';
import { ReorderItineraryDto } from './dto/reorder-itinerary.dto';
import { JwtPayload } from '../auth/decorators/current-user.decorator';
export declare class ItineraryController {
    private readonly itineraryService;
    constructor(itineraryService: ItineraryService);
    getItinerary(tripId: string, user: JwtPayload): Promise<import("./itinerary.service").ItinerarySnapshot>;
    createItem(tripId: string, dto: CreateItineraryItemDto, user: JwtPayload): Promise<import("./itinerary.service").ItinerarySnapshot>;
    updateItem(tripId: string, itemId: string, dto: UpdateItineraryItemDto, user: JwtPayload): Promise<import("./itinerary.service").ItinerarySnapshot>;
    deleteItem(tripId: string, itemId: string, user: JwtPayload): Promise<import("./itinerary.service").ItinerarySnapshot>;
    reorder(tripId: string, dto: ReorderItineraryDto, user: JwtPayload): Promise<import("./itinerary.service").ItinerarySnapshot>;
}
