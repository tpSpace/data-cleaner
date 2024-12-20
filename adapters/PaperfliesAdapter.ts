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
            id: this.safeGet<string>(entry, "hotel_id", ""),
            destination_id: this.safeGet<string>(entry, "destination_id", ""),
            name: this.safeGet<string>(entry, "hotel_name", ""),
            location: {
              lat: this.safeGet<number>(geo, "lat", 0),
              lng: this.safeGet<number>(geo, "lng", 0),
              address: this.safeGet<string>(location, "address", ""),
              city: this.safeGet<string>(location, "city", ""),
              country: this.safeGet<string>(location, "country", ""),
            },
            description: this.safeGet<string>(entry, "details", ""),
            amenities: {
              general: this.safeGet<string[]>(entry.amenities, "general", []),
              room: this.safeGet<string[]>(entry.amenities, "room", []),
            },
            images: {
              rooms: entry.images.rooms.map((img) => ({
                link: img.link,
                description: img.caption,
              })),
              site: entry.images.site.map((img) => ({
                link: img.link,
                description: img.caption,
              })),
              amenities: [],
            },
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
