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
    // remove redundant data

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

    // Handle images and ensure uniqueness using hashmap
    if (newHotel.images) {
      existingHotel.images = {
        rooms: this.mergeUniqueWithHashmap(
          existingHotel.images?.rooms,
          newHotel.images?.rooms
        ),
        site: this.mergeUniqueWithHashmap(
          existingHotel.images?.site,
          newHotel.images?.site
        ),
        amenities: this.mergeUniqueWithHashmap(
          existingHotel.images?.amenities,
          newHotel.images?.amenities
        ),
      };
    }

    if (newHotel.amenities) {
      existingHotel.amenities = {
        general: this.removeDuplicatesAcrossCategories(
          existingHotel.amenities?.general,
          newHotel.amenities?.general,
          existingHotel.amenities?.room,
          newHotel.amenities?.room
        ),
        room: this.mergeUniqueWithHashmap(
          existingHotel.amenities?.room,
          newHotel.amenities?.room
        ),
      };
    }

    // Handle booking conditions and ensure uniqueness using hashmap
    if (newHotel.booking_conditions) {
      existingHotel.booking_conditions = this.mergeUniqueWithHashmap(
        existingHotel.booking_conditions,
        newHotel.booking_conditions
      );
    }

    if (newHotel.description) {
      if (
        !existingHotel.description ||
        newHotel.description.length > existingHotel.description.length
      ) {
        existingHotel.description = newHotel.description;
      }
    }
  }

  /**
   * Helper method to merge arrays and remove duplicates using hashmap.
   * @param existingItems Existing array of items
   * @param newItems New array of items to merge
   * @returns A merged array with unique items
   */
  private mergeUniqueWithHashmap(
    existingItems: any[] = [],
    newItems: any[] = []
  ): any[] {
    const itemMap: { [key: string]: boolean } = {}; // Hashmap for tracking unique items
    const result: any[] = [];

    // Add existing items to the hashmap and result
    for (const item of existingItems) {
      const key =
        typeof item === "object" ? JSON.stringify(item) : item.toString();
      if (!itemMap[key]) {
        itemMap[key] = true;
        result.push(item);
      }
    }

    // Add new items to the hashmap and result
    for (const item of newItems) {
      const key =
        typeof item === "object" ? JSON.stringify(item) : item.toString();
      if (!itemMap[key]) {
        itemMap[key] = true;
        result.push(item);
      }
    }

    return result;
  }

  /**
   * Helper method to remove duplicates across general and room categories.
   * Items in `general` that also exist in `room` are removed from `general`.
   * Both arrays are compared case-insensitively.
   * @param existingGeneral Existing general amenities
   * @param newGeneral New general amenities
   * @param existingRoom Existing room amenities
   * @param newRoom New room amenities
   * @returns A deduplicated array for the general field
   */
  private removeDuplicatesAcrossCategories(
    existingGeneral: string[] = [],
    newGeneral: string[] = [],
    existingRoom: string[] = [],
    newRoom: string[] = []
  ): string[] {
    const generalItems = this.mergeUniqueWithHashmap(
      existingGeneral,
      newGeneral
    ).map((item) => item.toLowerCase());
    const roomItems = this.mergeUniqueWithHashmap(existingRoom, newRoom).map(
      (item) => item.toLowerCase()
    );

    const roomSet = new Set(roomItems); // Convert room items to a Set for fast lookups
    return generalItems.filter((item) => !roomSet.has(item)); // Exclude items in room from general
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
