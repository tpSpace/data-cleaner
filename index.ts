import { HotelDataProcessor } from "./core/HotelDataProcessor";

(async () => {
  const args = process.argv.slice(2);

  const hotelIds = args[0] === "none" ? [] : args[0].split(",");
  const destinationIds = args[1] === "none" ? [] : args[1].split(",");

  const processord = new HotelDataProcessor();
  const result = await processord.process(hotelIds, destinationIds);

  console.log(JSON.stringify(result, null, 2));
})();
