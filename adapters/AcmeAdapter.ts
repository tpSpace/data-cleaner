import { Hotel, AcmeSupplier, Image } from "../core/types";
import { SupplierAdapter } from "./SupplierAdapter";

export class AcmeAdapter extends SupplierAdapter {
  private safeGet<T>(obj: any, key: string, defaultValue: T): T {
    return obj && obj[key] !== undefined && obj[key] !== null
      ? (obj[key] as T)
      : defaultValue;
  }

  transform(data: AcmeSupplier[]): Hotel[] {
    if (!Array.isArray(data)) {
      console.warn("Invalid input: Expected array of AcmeSupplier");
      return [];
    }

    return data
      .map((entry): Hotel | null => {
        // Explicitly type the map callback
        try {
          const amenities = this.safeGet<Record<string, string[]>>(
            entry,
            "amenities",
            {
              general: [],
              room: [],
            }
          );

          return {
            id: this.safeGet<string>(entry, "Id", ""),
            destination_id: this.safeGet<string>(entry, "DestinationId", ""),
            name: this.safeGet<string>(entry, "Name", ""),
            location: {
              lat: this.safeGet<number>(entry, "Latitude", 0),
              lng: this.safeGet<number>(entry, "Longitude", 0),
              address: this.safeGet<string>(entry, "Address", ""),
              city: this.safeGet<string>(entry, "City", ""),
              country: this.safeGet<string>(entry, "Country", ""),
            },
            description: this.safeGet<string>(entry, "Description", ""),
            amenities: {
              general: this.safeGet<string[]>(entry, "Facilities", []),
              room: this.safeGet<string[]>(amenities, "room", []),
            },
            images: this.safeGet<{
              rooms: Image[];
              site: Image[];
              amenities: Image[];
            }>(entry, "images", {
              rooms: [],
              site: [],
              amenities: [],
            }),
            booking_conditions: this.safeGet<string[]>(
              entry,
              "bookingConditions",
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
