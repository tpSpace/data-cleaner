import { Hotel } from "../core/types";

export abstract class SupplierAdapter {
  abstract transform(data: any[]): Hotel[];
}
