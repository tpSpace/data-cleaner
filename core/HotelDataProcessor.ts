import { Hotel } from "./types";
import { HotelDataFetcher } from "./HotelDataFetcher";

export class HotelDataProcessor {
  async process(
    hotelIds: string[],
    destinationIds: string[]
  ): Promise<Hotel[]> {
    const fetcher = new HotelDataFetcher();
    const data = await fetcher.fetchData(); // assuming this fetches data from different suppliers
    const mergedData = this.mergeData(data);

    this.printColoredJSON(mergedData);

    return this.filterData(mergedData, hotelIds, destinationIds);
  }

  private mergeData(hotels: Hotel[]): Hotel[] {
    const mergedData: Hotel[] = [];

    // Iterate over the hotels (from various suppliers)
    for (const hotel of hotels) {
      const existingHotel = mergedData.find((h) => h.id === hotel.id);

      if (existingHotel) {
        // Merge missing fields from the new hotel data into the existing one
        this.mergeHotelFields(existingHotel, hotel);
      } else {
        // If it's a new hotel, simply add it
        mergedData.push({ ...hotel });
      }
    }

    return mergedData;
  }

  private mergeHotelFields(existingHotel: Hotel, newHotel: Hotel): void {
    // Merge the general fields
    Object.keys(newHotel).forEach((key) => {
      if (newHotel[key] !== undefined && existingHotel[key] === undefined) {
        existingHotel[key] = newHotel[key];
      }
    });

    // Specifically handle complex objects like 'location' and 'images'
    // with location check if it exists and merge the fields
    if (newHotel.location) {
      const mergedLocation = {
        lat: newHotel.location.lat || existingHotel.location.lat,
        lng: newHotel.location.lng || existingHotel.location.lng,
        address: newHotel.location.address || existingHotel.location.address,
        city: newHotel.location.city || existingHotel.location.city,
        country: newHotel.location.country || existingHotel.location.country,
      };
      existingHotel.location = mergedLocation;
    }

    if (newHotel.images) {
      existingHotel.images = {
        rooms: Array.from(
          new Set([...existingHotel.images.rooms, ...newHotel.images.rooms])
        ),
        site: Array.from(
          new Set([...existingHotel.images.site, ...newHotel.images.site])
        ),
        amenities: Array.from(
          new Set([
            ...existingHotel.images.amenities,
            ...newHotel.images.amenities,
          ])
        ),
      };
    }

    if (newHotel.amenities) {
      existingHotel.amenities = {
        general: Array.from(
          new Set([
            ...existingHotel.amenities.general,
            ...newHotel.amenities.general,
          ])
        ),
        room: Array.from(
          new Set([...existingHotel.amenities.room, ...newHotel.amenities.room])
        ),
      };
    }

    if (newHotel.booking_conditions) {
      existingHotel.booking_conditions = Array.from(
        new Set([
          ...existingHotel.booking_conditions,
          ...newHotel.booking_conditions,
        ])
      );
    }
  }

  private filterData(
    hotels: Hotel[],
    hotelIds: string[],
    destinationIds: string[]
  ): Hotel[] {
    return hotels.filter((hotel) => {
      const matchesHotelId = !hotelIds.length || hotelIds.includes(hotel.id);
      const matchesDestinationId =
        !destinationIds.length ||
        destinationIds.includes(hotel.destination_id.toString());
      return matchesHotelId && matchesDestinationId;
    });
  }

  private printColoredJSON(data: Hotel[]): void {
    const jsonString = JSON.stringify(data, null, 2);
    const coloredJsonString = jsonString
      .replace(/"([^"]+)":/g, (match, p1) => `\x1b[32m"${p1}":\x1b[0m`)
      .replace(/: "([^"]+)"/g, (match, p1) => `: \x1b[33m"${p1}"\x1b[0m`)
      .replace(/: (\d+)/g, (match, p1) => `: \x1b[34m${p1}\x1b[0m`);

    console.log(coloredJsonString);
  }
}
