import { getForecast } from "./request-utils";
import "./styles/styles.scss";

// use local storage to keep track of location
export let locationStorage = localStorage.getItem("location") || "";

if (locationStorage.length === 0) {
  getForecast();
} else {
  getForecast(locationStorage);
}
