import { Hotel, Image } from "../core/types";
import { SupplierAdapter } from "./SupplierAdapter";

export interface PatagoniaSupplier {
  id: string;
  destination: string;
  name: string;
  lat: number;
  lng: number;
  info: string;
  amenities: string[];
  images: {
    rooms: patagoniaImage[];
    amenities: patagoniaImage[];
  };
}

export interface patagoniaImage {
  url: string;
  description: string;
}

export class PatagoniaAdapter extends SupplierAdapter {
  transform(data: PatagoniaSupplier[]): Hotel[] {
    if (!Array.isArray(data)) {
      console.warn("Invalid input: Expected array of PatagoniaSupplier");
      return [];
    }

    return data
      .map((entry): Hotel | null => {
        try {
          return {
            id: entry.id,
            destination_id: entry.destination,
            name: entry.name,
            location: {
              lat: entry.lat,
              lng: entry.lng,
              address: "", // Address not provided
              city: "", // City not provided
              country: "", // Country not provided
            },
            description: entry.info,
            amenities: {
              general: [], // General amenities not provided
              room: entry.amenities || [],
            },
            images: {
              rooms: entry.images.rooms.map((img) => ({
                link: img.url,
                description: img.description,
              })),
              site: [], // Site images not provided
              amenities: entry.images.amenities.map((img) => ({
                link: img.url,
                description: img.description,
              })),
            },
            booking_conditions: [], // Booking conditions not provided
          };
        } catch (error) {
          console.error(`Error transforming entry: ${error}`);
          return null;
        }
      })
      .filter((hotel): hotel is Hotel => hotel !== null);
  }
}
