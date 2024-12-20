import axios from "axios";
import { Hotel } from "./types";
import { AcmeAdapter } from "../adapters/AcmeAdapter";
import { PatagoniaAdapter } from "../adapters/PatagoniaAdapter";
import { PaperfliesAdapter } from "../adapters/PaperfliesAdapter";

const SUPPLIERS = [
  {
    name: "acme",
    url: "https://5f2be0b4ffc88500167b85a0.mockapi.io/suppliers/acme",
  },
  {
    name: "patagonia",
    url: "https://5f2be0b4ffc88500167b85a0.mockapi.io/suppliers/patagonia",
  },
  {
    name: "paperflies",
    url: "https://5f2be0b4ffc88500167b85a0.mockapi.io/suppliers/paperflies",
  },
];

export class HotelDataFetcher {
  async fetchData(): Promise<Hotel[]> {
    const adapters = {
      acme: new AcmeAdapter(),
      patagonia: new PatagoniaAdapter(),
      paperflies: new PaperfliesAdapter(),
    };

    const results: Hotel[] = [];
    for (const supplier of SUPPLIERS) {
      const response = await axios.get(supplier.url);
      results.push(...adapters[supplier.name].transform(response.data));
    }
    return results;
  }
}
