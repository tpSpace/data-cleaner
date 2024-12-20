import { Hotel } from "./types";
import { HotelDataFetcher } from "./HotelDataFetcher";

interface MergedHotel {
  id: string;
  [key: string]: any;
}

export class HotelDataProcessor {
  async process(
    hotelIds: string[],
    destinationIds: string[]
  ): Promise<Hotel[]> {
    const fetcher = new HotelDataFetcher();
    const data = await fetcher.fetchData();
    console.log(JSON.stringify(data, null, 2));
    const mergedData = this.mergeData(data);

    return this.filterData(mergedData, hotelIds, destinationIds);
  }

  private mergeData(hotels: Hotel[]): Hotel[] {
    const mergedMap: { [key: string]: MergedHotel } = {};
    for (const hotel of hotels) {
      if (!mergedMap[hotel.id]) {
        mergedMap[hotel.id] = hotel;
      } else {
        const existing = mergedMap[hotel.id];
        Object.keys(hotel).forEach((key) => {
          const field = key as keyof Hotel;
          if (hotel[field]) {
            if (typeof hotel[field] === "object") {
              mergedMap[hotel.id][field] = {
                ...existing[field],
                ...hotel[field],
              };
            } else {
              mergedMap[hotel.id][field] = hotel[field];
            }
          }
        });
      }
    }
    return Object.values(mergedMap) as Hotel[];
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
}
