import { getForecast } from "./request-utils";
import { tempTypeStorage } from "./main-grid";

const savedLocationsContainer = document.querySelector(".saved-locations");

export const createSavedLocations = () => {
  // get saved locations
  let savedLocations = JSON.parse(localStorage.getItem("saved-location")) || [];

  if (savedLocations.length === 0) {
    const emptyParagraph = document.createElement("p");
    emptyParagraph.classList.add("empty-locations");
    emptyParagraph.textContent = "No saved locations";
    savedLocationsContainer.appendChild(emptyParagraph);
    return;
  }

  // create saved location item for each saved location
  savedLocations.forEach(async (location) => {
    const latLon = `${location.lat},${location.lon}`;
    const weatherForecast = await getWeatherForecast(latLon);

    const locationData = weatherForecast.locationInfo;
    const forecast = weatherForecast.locationForecast;
    const forecastArr = weatherForecast.locationForecast.forecastday[0];
    const currentArr = weatherForecast.locationCurrent;

    const savedLocationItem = document.createElement("div");
    savedLocationItem.classList.add("saved-location");

    const closeIconContainer = document.createElement("div");
    closeIconContainer.classList.add("close-icon");
    const closeIcon = document.createElement("i");
    closeIcon.classList.add("fa-solid", "fa-xmark");

    const savedLocationLeftSide = document.createElement("div");
    savedLocationLeftSide.classList.add("saved-left-side");

    const savedLocationTopLeft = document.createElement("div");
    savedLocationTopLeft.classList.add("saved-top-left");

    const savedTitle = document.createElement("div");
    savedTitle.classList.add("saved-title");
    savedTitle.textContent = location.title;
    const savedTime = document.createElement("div");
    savedTime.classList.add("saved-time");
    const savedTimeText = new Date(
      locationData.localtime.replace(/-/g, "/")
    ).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    savedTime.textContent =
      savedTimeText[0] != 0
        ? savedTimeText
        : savedTimeText.slice(1, savedTimeText.length);

    const savedDescript = document.createElement("div");
    savedDescript.classList.add("saved-descript");
    savedDescript.textContent = currentArr.condition.text;

    const savedRightSide = document.createElement("div");
    savedRightSide.classList.add("saved-right-side");
    const savedTemp = document.createElement("div");
    savedTemp.classList.add("saved-temp");
    savedTemp.textContent = `${
      tempTypeStorage === "f"
        ? Math.round(currentArr.temp_f)
        : Math.round(currentArr.temp_c)
    }\u00B0`;

    const savedHighLow = document.createElement("div");
    savedHighLow.classList.add("saved-high-low");
    const savedHigh = document.createElement("span");
    savedHigh.classList.add("saved-high");
    savedHigh.textContent = `H:${
      tempTypeStorage === "f"
        ? Math.round(forecastArr.day.maxtemp_f)
        : Math.round(forecastArr.day.maxtemp_c)
    }\u00B0`;
    const savedLow = document.createElement("span");
    savedLow.classList.add("saved-low");
    savedLow.textContent = `L:${
      tempTypeStorage === "f"
        ? Math.round(forecastArr.day.mintemp_f)
        : Math.round(forecastArr.day.mintemp_c)
    }\u00B0`;

    // add event listeners
    document.addEventListener("click", (e) => {
      if (
        closeIconContainer.contains(e.target) ||
        closeIcon.contains(e.target)
      ) {
        const updatedSavedLocations = savedLocations.filter(
          (locationToDelete) => locationToDelete.id !== location.id
        );
        localStorage.setItem(
          "saved-location",
          JSON.stringify(updatedSavedLocations)
        );
        const storedLocation = localStorage.getItem("location") || "";
        getForecast(storedLocation);
      } else if (savedLocationItem.contains(e.target)) {
        localStorage.setItem("location", latLon);
        getForecast(latLon);
      }
    });

    // append saved location to DOM
    closeIconContainer.appendChild(closeIcon);
    savedLocationTopLeft.append(savedTitle, savedTime);
    savedLocationLeftSide.append(savedLocationTopLeft, savedDescript);
    savedHighLow.append(savedHigh, savedLow);
    savedRightSide.append(savedTemp, savedHighLow);

    savedLocationItem.append(
      closeIconContainer,
      savedLocationLeftSide,
      savedRightSide
    );
    savedLocationsContainer.appendChild(savedLocationItem);
  });
};

// get weather forecast for each saved location function
const getWeatherForecast = async (location) => {
  try {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=922b671388894582ab8201238232504&q=${location}&days=2`;
    const response = fetch(url, { mode: "cors" });
    const locationData = await response;
    if (!locationData.ok) {
      throw new Error("HTTP Status: " + locationData.status);
    }
    const locationJson = await locationData.json();
    const locationInfo = locationJson.location;
    const locationForecast = locationJson.forecast;
    const locationCurrent = locationJson.current;
    return { locationInfo, locationForecast, locationCurrent };
  } catch (err) {
    console.log("Error: ", err);
  }
};
