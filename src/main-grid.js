import { clearElement } from "./request-utils";
import { createDailyForecast } from "./daily-forecast";
import { createSavedLocations } from "./saved-locations";

function importAll(r) {
  let images = {};
  r.keys().map((item, index) => {
    images[item.replace("./", "")] = r(item);
  });
  return images;
}

const dayImages = importAll(
  require.context("./imgs/icons/day", false, /\.(png|jpe?g|svg)$/)
);

const nightImages = importAll(
  require.context("./imgs/icons/night", false, /\.(png|jpe?g|svg)$/)
);

// use local storage to keep track of temp type
export let tempTypeStorage = localStorage.getItem("tempType") || "f";

const locationTitleSection = document.querySelector(".location-title-section");
const locationCurrentInfo = document.querySelector(".location-info");
const additionalInfo = document.querySelector(".additional-weather-info");
const savedLocationsContainer = document.querySelector(".saved-locations");
const header = document.querySelector("header");
const searchBox = document.querySelector(".search-box");

export const createMainItem = (
  locationInfo,
  locationCurrent,
  locationForecast
) => {
  clearElement(locationTitleSection);
  clearElement(locationCurrentInfo);
  clearElement(additionalInfo);
  clearElement(savedLocationsContainer);

  // check if its night time or day time
  const time = new Date(locationInfo.localtime.replace(/-/g, "/"));
  const daySunrise = new Date(
    `${locationForecast.forecastday[0].date} ${locationForecast.forecastday[0].astro.sunrise}`.replace(
      /-/g,
      "/"
    )
  );
  const daySunset = new Date(
    `${locationForecast.forecastday[0].date} ${locationForecast.forecastday[0].astro.sunset}`.replace(
      /-/g,
      "/"
    )
  );

  if (time > daySunrise && time < daySunset) {
    document.body.classList.remove("night-bg-linear");
    header.classList.remove("night-bg");
    searchBox.classList.remove("night-bg-light");
  } else if (time > daySunrise && time > daySunset) {
    document.body.classList.add("night-bg-linear");
    header.classList.add("night-bg");
    searchBox.classList.add("night-bg-light");
  } else if (time < daySunrise) {
    document.body.classList.add("night-bg-linear");
    header.classList.add("night-bg");
    searchBox.classList.add("night-bg-light");
  }

  // get saved locations
  let savedLocations = JSON.parse(localStorage.getItem("saved-location")) || [];

  // creating info
  // create location title
  const locationH2Container = document.createElement("div");
  locationH2Container.classList.add("location-h2-container");
  const locationH2Title = document.createElement("h2");
  locationH2Title.textContent = `${locationInfo.name}, ${
    locationInfo.country == "United States of America" ||
    locationInfo.country == "USA"
      ? locationInfo.region
      : locationInfo.country
  }`;

  const saveLocationBtn = document.createElement("span");
  saveLocationBtn.classList.add("header-btn");

  const locationIsSaved = savedLocations.find((location) => {
    if (
      locationInfo.lat === location.lat &&
      locationInfo.lon === location.lon
    ) {
      return true;
    } else if (
      location.name === locationInfo.name &&
      location.region === locationInfo.region &&
      location.country === locationInfo.country
    ) {
      return true;
    }
  });

  if (locationIsSaved) {
    saveLocationBtn.classList.add("remove-location-btn");
    saveLocationBtn.id = "remove";
    saveLocationBtn.textContent = "Remove";
  } else {
    saveLocationBtn.classList.add("save-location-btn");
    saveLocationBtn.id = "save";
    saveLocationBtn.textContent = "Save";
  }

  // create temp type toggle
  const tempTypeWrapper = document.createElement("div");
  tempTypeWrapper.classList.add("temp-type-wrapper");
  if (time > daySunrise && time < daySunset) {
    tempTypeWrapper.classList.remove("night-bg-light");
  } else if (time > daySunrise && time > daySunset) {
    tempTypeWrapper.classList.add("night-bg-light");
  } else if (time < daySunrise) {
    tempTypeWrapper.classList.add("night-bg-light");
  }
  const tempTypeF = document.createElement("span");
  tempTypeF.classList.add("temp-type");
  tempTypeF.dataset.type = "type-f";
  tempTypeF.textContent = "\u2109";
  const tempTypeC = document.createElement("span");
  tempTypeC.classList.add("temp-type");
  tempTypeC.dataset.type = "type-c";
  tempTypeC.textContent = "\u2103";
  const tempTypeCover = document.createElement("div");
  tempTypeCover.classList.add("temp-type-cover");
  if (tempTypeStorage === "c") {
    tempTypeCover.classList.add("move");
  }

  saveLocationBtn.addEventListener("click", (e) => {
    if (e.target.id === "remove") {
      const locationToDelete = savedLocations.find((location) => {
        if (
          locationInfo.lat === location.lat &&
          locationInfo.lon === location.lon
        ) {
          return true;
        } else if (
          location.name === locationInfo.name &&
          location.region === locationInfo.region &&
          location.country === locationInfo.country
        ) {
          return true;
        }
      });

      const updatedSavedLocations = savedLocations.filter(
        (location) => location.id !== locationToDelete.id
      );
      localStorage.setItem(
        "saved-location",
        JSON.stringify(updatedSavedLocations)
      );
      createMainItem(locationInfo, locationCurrent, locationForecast);
      createSavedLocations(locationForecast);
    }

    if (e.target.id === "save") {
      // collect location info for local storage
      let savedLocation = {
        id: new Date().valueOf(),
        name: locationInfo.name,
        region: locationInfo.region,
        country: locationInfo.country,
        lat: locationInfo.lat,
        lon: locationInfo.lon,
        title: locationH2Title.textContent,
      };
      savedLocations.push(savedLocation);
      localStorage.setItem("saved-location", JSON.stringify(savedLocations));
      createMainItem(locationInfo, locationCurrent, locationForecast);
      createSavedLocations(locationForecast);
    }
  });

  tempTypeWrapper.addEventListener("click", () => {
    if (tempTypeCover.classList.contains("move")) {
      tempTypeCover.classList.remove("move");
      tempTypeStorage = "f";
    } else {
      tempTypeCover.classList.add("move");
      tempTypeStorage = "c";
    }
    localStorage.setItem("tempType", tempTypeStorage);
    // rerender with new temp type
    createMainItem(locationInfo, locationCurrent, locationForecast);
    createDailyForecast(locationForecast);
    createSavedLocations(locationForecast);
  });

  // append temp type info
  tempTypeWrapper.append(tempTypeF, tempTypeC, tempTypeCover);

  // appending title info
  locationH2Container.append(locationH2Title, saveLocationBtn);
  locationTitleSection.append(locationH2Container, tempTypeWrapper);

  // create location current info section
  const locationInfoTitle = document.createElement("div");
  locationInfoTitle.classList.add("info-title");
  const locationInfoTitleWrapper = document.createElement("div");
  locationInfoTitleWrapper.classList.add("lcoation-info-title-wrapper");
  const locationInfoH3 = document.createElement("h3");
  locationInfoH3.textContent = "Current weather";
  const infoDate = document.createElement("p");
  infoDate.classList.add("info-date");
  const formattedDate = new Date(locationInfo.localtime.replace(/-/g, "/"));
  const formattedMonth = formattedDate.toLocaleString("default", {
    month: "long",
  });
  infoDate.textContent = `${formattedMonth} ${formattedDate.getDate()}, ${formattedDate.getFullYear()}`;
  const infoDescription = document.createElement("div");
  infoDescription.classList.add("info-description");
  const infoP = document.createElement("p");
  const currentInfoTime = new Date(
    locationInfo.localtime.replace(/-/g, "/")
  ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  infoP.textContent =
    currentInfoTime[0] != 0
      ? currentInfoTime
      : currentInfoTime.slice(1, currentInfoTime.length);

  // create location weather info
  const infoWeather = document.createElement("div");
  infoWeather.classList.add("info-weather");
  const weatherInfoContainer = document.createElement("div");
  weatherInfoContainer.classList.add("weather-info-container");
  const infoWeatherLeft = document.createElement("div");
  infoWeatherLeft.classList.add("info-weather-left");
  const infoIcon = document.createElement("div");
  infoIcon.classList.add("info-icon");
  const infoIconImg = document.createElement("img");
  // get icon file path
  const createImg = locationCurrent.condition.icon;
  const dayOrNightIdx = createImg.indexOf(
    `${createImg.indexOf("day") < 0 ? "night" : "day"}`
  );
  const iconPath = createImg.slice(dayOrNightIdx, createImg.length);
  infoIconImg.src = "./imgs/icons/" + iconPath;

  const infoTemp = document.createElement("h3");
  infoTemp.classList.add("info-temp");
  const tempTypeToShow =
    tempTypeStorage === "f" ? locationCurrent.temp_f : locationCurrent.temp_c;
  const tempDegreeSymbol = tempTypeStorage === "f" ? "&deg;F" : "&#8451;";
  infoTemp.innerHTML = `${Math.round(
    tempTypeToShow
  )}<sup class="degree">${tempDegreeSymbol}</sup>`;

  const infoTempWords = document.createElement("div");
  infoTempWords.classList.add("info-temp-words");
  const infoTempDescript = document.createElement("p");
  infoTempDescript.classList.add("info-temp-descript");
  infoTempDescript.textContent = locationCurrent.condition.text;
  const infoTempFeel = document.createElement("p");
  infoTempFeel.classList.add("info-temp-feel");
  const feelsLikeTemp =
    tempTypeStorage === "f"
      ? locationCurrent.feelslike_f
      : locationCurrent.feelslike_c;
  infoTempFeel.textContent = `Feels like ${Math.round(feelsLikeTemp)}\u00B0`;

  // create additional weather info
  const additionalInfoGrid = document.createElement("div");
  additionalInfoGrid.classList.add("additional-info-grid");
  // humidity info
  const humidityInfo = document.createElement("div");
  humidityInfo.classList.add("additional-info-item");
  const humidityTitle = document.createElement("p");
  humidityTitle.classList.add("additional-info-title");
  humidityTitle.textContent = "Humidity";
  const humidityValue = document.createElement("p");
  humidityValue.classList.add("additional-info");
  humidityValue.textContent = `${locationCurrent.humidity}%`;
  // sunrise info
  const sunriseInfo = document.createElement("div");
  sunriseInfo.classList.add("additional-info-item");
  const sunriseTitle = document.createElement("p");
  sunriseTitle.classList.add("additional-info-title");
  sunriseTitle.textContent = "Sunrise";
  const sunriseValue = document.createElement("p");
  sunriseValue.classList.add("additional-info");
  const sunrise = locationForecast.forecastday[0].astro.sunrise;
  sunriseValue.textContent = sunrise[0] == 0 ? sunrise.slice(1) : sunrise;
  // UV Index info
  const uvInfo = document.createElement("div");
  uvInfo.classList.add("additional-info-item");
  const uvInfoTitle = document.createElement("p");
  uvInfoTitle.classList.add("additional-info-title");
  uvInfoTitle.textContent = "UV Index";
  const uvValue = document.createElement("p");
  uvValue.classList.add("additional-info");
  uvValue.textContent = locationCurrent.uv;
  // wind info
  const windIfo = document.createElement("div");
  windIfo.classList.add("additional-info-item");
  const windTitle = document.createElement("p");
  windTitle.classList.add("additional-info-title");
  windTitle.textContent = "Wind";
  const windValue = document.createElement("p");
  windValue.classList.add("additional-info");
  windValue.innerHTML = `${Math.round(
    locationCurrent.wind_mph
  )} mph <i style="transform: rotate(${
    locationCurrent.wind_degree - 45
  }deg)" class="fa-solid fa-location-arrow"></i>`;
  // sunset info
  const sunsetInfo = document.createElement("div");
  sunsetInfo.classList.add("additional-info-item");
  const sunsetTitle = document.createElement("p");
  sunsetTitle.classList.add("additional-info-title");
  sunsetTitle.textContent = "Sunset";
  const sunsetValue = document.createElement("p");
  sunsetValue.classList.add("additional-info");
  const sunset = locationForecast.forecastday[0].astro.sunset;
  sunsetValue.textContent = sunset[0] == 0 ? sunset.slice(1) : sunset;
  // visibility info
  const visibilityInfo = document.createElement("div");
  visibilityInfo.classList.add("additional-info-item");
  const visibilityTitle = document.createElement("p");
  visibilityTitle.classList.add("additional-info-title");
  visibilityTitle.textContent = "Visibility";
  const visibilityValue = document.createElement("p");
  visibilityValue.classList.add("additional-info");
  visibilityValue.textContent = `${locationCurrent.vis_miles} mi`;

  // create hourly forecast
  const currentTime = new Date(
    locationInfo.localtime.replace(/-/g, "/")
  ).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const trimCurrentTime =
    currentTime[0] != 0
      ? currentTime
      : currentTime.slice(1, currentTime.length);
  const timeStart = trimCurrentTime.slice(0, trimCurrentTime.indexOf(":"));
  const timeOfDay = trimCurrentTime.slice(-2);
  const shortHandTime = `${timeStart}${timeOfDay} ${new Date(
    locationInfo.localtime.replace(/-/g, "/")
  ).toLocaleDateString()}`;

  const neededHourlyArray = [];
  const currentDay = locationForecast.forecastday[0].hour;
  const secondDay = locationForecast.forecastday[1].hour;
  const hourlyArray = [...currentDay, ...secondDay];
  hourlyArray.forEach((hour) => {
    const hourTime = new Date(hour.time.replace(/-/g, "/")).toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
    const trimHourTime =
      hourTime[0] != 0 ? hourTime : hourTime.slice(1, hourTime.length);
    const hourStart = trimHourTime.slice(0, trimHourTime.indexOf(":"));
    const partOfDay = trimHourTime.slice(-2);
    const shorthandHour = `${hourStart}${partOfDay}`;
    const hourObj = {
      date: `${shorthandHour} ${new Date(
        hour.time.replace(/-/g, "/")
      ).toLocaleDateString()}`,
      time: shorthandHour,
      icon: hour.condition.icon,
      temp: tempTypeStorage === "f" ? hour.temp_f : hour.temp_c,
    };
    neededHourlyArray.push(hourObj);
  });

  const hourlyIndex = neededHourlyArray.findIndex(
    (item) => item.date === shortHandTime
  );

  const trimmedHourlyArray = neededHourlyArray.slice(
    hourlyIndex,
    hourlyIndex + 24
  );

  const hourlyForecast = document.createElement("div");
  hourlyForecast.classList.add("hourly-forecast");

  trimmedHourlyArray.forEach((hourly, index) => {
    const forecastItem = document.createElement("div");
    forecastItem.classList.add("forecast-item");
    forecastItem.setAttribute("draggable", false);
    const forecastTime = document.createElement("p");
    forecastTime.classList.add("forecast-time");
    forecastTime.textContent = index === 0 ? "Now" : hourly.time;
    const forecastIconWrapper = document.createElement("div");
    forecastIconWrapper.classList.add("forecast-icon");
    const forecastIcon = document.createElement("img");
    // get img path for hourly index thats not index 0
    if (index !== 0) {
      const dayOrNightIdx = hourly.icon.indexOf(
        `${hourly.icon.indexOf("day") < 0 ? "night" : "day"}`
      );
      const iconPath = hourly.icon.slice(dayOrNightIdx, hourly.icon.length);
      forecastIcon.src = "./imgs/icons/" + iconPath;
    } else {
      const dayOrNightIdxNow = locationCurrent.condition.icon.indexOf(
        `${locationCurrent.condition.icon.indexOf("day") < 0 ? "night" : "day"}`
      );
      const iconPathNow = locationCurrent.condition.icon.slice(
        dayOrNightIdxNow,
        locationCurrent.condition.length
      );
      forecastIcon.src = "./imgs/icons/" + iconPathNow;
    }
    const forecastTemp = `${Math.round(hourly.temp)}\u00B0`;

    forecastIconWrapper.appendChild(forecastIcon);
    forecastItem.append(forecastTime, forecastIconWrapper, forecastTemp);
    hourlyForecast.appendChild(forecastItem);
  });

  // scroll function for hourly weather
  let prevPageX, prevScrollLeft;
  let isDragging = false;

  const dragStart = (e) => {
    isDragging = true;
    prevPageX = e.pageX || e.touches[0].pageX;
    prevScrollLeft = hourlyForecast.scrollLeft;
  };

  const dragging = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    hourlyForecast.classList.add("dragging");
    let positionDiff = (e.pageX || e.touches[0].pageX) - prevPageX;
    hourlyForecast.scrollLeft = prevScrollLeft - positionDiff;
  };

  const dragStop = () => {
    isDragging = false;
    hourlyForecast.classList.remove("dragging");
  };

  hourlyForecast.addEventListener("mousedown", dragStart);
  hourlyForecast.addEventListener("touchstart", dragStart);

  hourlyForecast.addEventListener("mousemove", dragging);
  hourlyForecast.addEventListener("touchmove", dragging);

  hourlyForecast.addEventListener("mouseup", dragStop);
  hourlyForecast.addEventListener("mouseleave", dragStop);
  hourlyForecast.addEventListener("touchend", dragStop);

  // append info to top section
  infoDescription.appendChild(infoP);
  locationInfoTitleWrapper.append(locationInfoH3, infoDate);
  locationInfoTitle.append(locationInfoTitleWrapper, infoDescription);

  // append to main info weather
  infoWeather.appendChild(weatherInfoContainer);
  weatherInfoContainer.append(infoWeatherLeft, infoTempWords);
  infoWeatherLeft.append(infoIcon, infoTemp);
  infoIcon.appendChild(infoIconImg);
  infoTempWords.append(infoTempDescript, infoTempFeel);

  // append additional info
  additionalInfo.appendChild(additionalInfoGrid);
  sunriseInfo.append(sunriseTitle, sunriseValue);
  humidityInfo.append(humidityTitle, humidityValue);
  uvInfo.append(uvInfoTitle, uvValue);
  windIfo.append(windTitle, windValue);
  sunsetInfo.append(sunsetTitle, sunsetValue);
  visibilityInfo.append(visibilityTitle, visibilityValue);
  additionalInfoGrid.append(
    humidityInfo,
    sunriseInfo,
    uvInfo,
    windIfo,
    sunsetInfo,
    visibilityInfo
  );

  // append to location current info section
  locationCurrentInfo.append(locationInfoTitle, infoWeather, hourlyForecast);
};
