import { Hotel, PatagoniaSupplier, Image } from "../core/types";
import { SupplierAdapter } from "./SupplierAdapter";

export class PatagoniaAdapter extends SupplierAdapter {
  private safeGet<T>(obj: any, key: string, defaultValue: T): T {
    return obj && obj[key] !== undefined && obj[key] !== null
      ? (obj[key] as T)
      : defaultValue;
  }

  transform(data: PatagoniaSupplier[]): Hotel[] {
    if (!Array.isArray(data)) {
      console.warn("Invalid input: Expected array of PatagoniaSupplier");
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

          const images = this.safeGet<{
            rooms: Image[];
            site: Image[];
            amenities: Image[];
          }>(entry, "images", {
            rooms: [],
            site: [],
            amenities: [],
          });

          return {
            id: this.safeGet<string>(entry, "hotel_id", "patagonclear"),
            destination_id: this.safeGet<string>(entry, "destination_id", ""),
            name: this.safeGet<string>(entry, "hotel_name", ""),
            location: {
              lat: this.safeGet<number>(entry, "latitude", 0),
              lng: this.safeGet<number>(entry, "longitude", 0),
              address: this.safeGet<string>(entry, "address", ""),
              city: this.safeGet<string>(entry, "city", ""),
              country: this.safeGet<string>(entry, "country", ""),
            },
            description: this.safeGet<string>(entry, "details", ""),
            amenities: {
              general: this.safeGet<string[]>(amenities, "general", []),
              room: this.safeGet<string[]>(amenities, "room", []),
            },
            images: images,
            booking_conditions: this.safeGet<string[]>(
              entry,
              "booking_conditions",
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
