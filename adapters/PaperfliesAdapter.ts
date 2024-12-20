import { Hotel, PaperfliesSupplier, Image } from "../core/types";
import { SupplierAdapter } from "./SupplierAdapter";

export class PaperfliesAdapter extends SupplierAdapter {
  private safeGet<T>(obj: any, key: string, defaultValue: T): T {
    return obj && obj[key] !== undefined && obj[key] !== null
      ? (obj[key] as T)
      : defaultValue;
  }

  transform(data: PaperfliesSupplier[]): Hotel[] {
    if (!Array.isArray(data)) {
      console.warn("Invalid input: Expected array of PaperfliesSupplier");
      return [];
    }

    return data
      .map((entry): Hotel | null => {
        try {
          const amenities = this.safeGet<Record<string, string[]>>(
            entry,
            "amenities",
            {
              general: [],
              room: [],
            }
          );

          const geo = this.safeGet<{ lat: number; lng: number }>(entry, "geo", {
            lat: 0,
            lng: 0,
          });

          const location = this.safeGet<Record<string, string>>(
            entry,
            "location",
            {
              address: "",
              city: "",
              country: "",
            }
          );

          return {
            id: this.safeGet<string>(entry, "hotelId", ""),
            destination_id: this.safeGet<string>(entry, "destinationId", ""),
            name: this.safeGet<string>(entry, "hotelName", ""),
            location: {
              lat: this.safeGet<number>(geo, "lat", 0),
              lng: this.safeGet<number>(geo, "lng", 0),
              address: this.safeGet<string>(location, "address", ""),
              city: this.safeGet<string>(location, "city", ""),
              country: this.safeGet<string>(location, "country", ""),
            },
            description: this.safeGet<string>(entry, "description", ""),
            amenities: {
              general: this.safeGet<string[]>(amenities, "general", []),
              room: this.safeGet<string[]>(amenities, "room", []),
            },
            images: {
              rooms: this.safeGet<Image[]>(entry, "rooms", []),
              site: this.safeGet<Image[]>(entry, "site", []),
              amenities: this.safeGet<Image[]>(entry, "amenities", []),
            },
            booking_conditions: this.safeGet<string[]>(
              entry,
              "bookingInfo",
              []
            ),
          };
        } catch (error) {
          console.error(`Error transforming hotel data: ${error}`);
          return null;
        }
      })
      .filter((hotel): hotel is Hotel => hotel !== null);
  }
}
