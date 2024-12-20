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
    this.printColoredJSON(data);
    const mergedData = this.mergeData(data);

    return this.filterData(mergedData, hotelIds, destinationIds);
  }

  private mergeData(hotels: Hotel[]): Hotel[] {
    const mergedMap: { [key: string]: MergedHotel } = {};
    for (const hotel of hotels) {
      if (!mergedMap[hotel.id]) {
        mergedMap[hotel.id] = { ...hotel };
      } else {
        const existing = mergedMap[hotel.id];
        Object.keys(hotel).forEach((key) => {
          const field = key as keyof Hotel;
          const newValue = hotel[field];
          if (newValue) {
            if (typeof newValue === "object" && !Array.isArray(newValue)) {
              existing[field] = {
                ...existing[field],
                ...newValue,
              };
            } else if (Array.isArray(newValue)) {
              existing[field] = Array.from(
                new Set([...existing[field], ...newValue])
              );
            } else {
              existing[field] = newValue;
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

  private printColoredJSON(data: Hotel[]): void {
    const jsonString = JSON.stringify(data, null, 2);
    const coloredJsonString = jsonString
      .replace(/"([^"]+)":/g, (match, p1) => `\x1b[32m"${p1}":\x1b[0m`)
      .replace(/: "([^"]+)"/g, (match, p1) => `: \x1b[33m"${p1}"\x1b[0m`)
      .replace(/: (\d+)/g, (match, p1) => `: \x1b[34m${p1}\x1b[0m`);

    console.log(coloredJsonString);
  }
}
