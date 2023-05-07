import { createMainItem } from "./main-grid.js";
import { createDailyForecast } from "./daily-forecast.js";
import { createSavedLocations } from "./saved-locations.js";

const searchResults = document.querySelector("[data-search-results]");
const searchBox = document.querySelector(".search-box");
const searchInput = document.querySelector("[data-search-input]");
const searchForm = document.querySelector("[data-search-form]");

// gets 10 day forecast / current weather data
export const getForecast = async (location = "tampa") => {
  try {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=922b671388894582ab8201238232504&q=${location}&days=3`;
    const response = fetch(url, { mode: "cors" });
    const locationData = await response;
    if (!locationData.ok) {
      throw new Error("HTTP Status: " + locationData.status);
    }
    const locationJson = await locationData.json();
    const locationInfo = locationJson.location;
    const locationCurrent = locationJson.current;
    const locationForecast = locationJson.forecast;

    createMainItem(locationInfo, locationCurrent, locationForecast);
    createDailyForecast(locationForecast);
    createSavedLocations();
  } catch (err) {
    console.log("Error: ", err);
  }
};

// gets search bar data
export const getSearchData = async (searchInput) => {
  if (searchInput.length === 0) {
    clearElement(searchResults);
    return;
  }
  try {
    const url = `https://api.weatherapi.com/v1/search.json?key=922b671388894582ab8201238232504&q=${searchInput}`;
    const response = fetch(url, { mode: "cors" });
    const searchResponse = await response;
    if (!searchResponse.ok) {
      throw new Error("HTTP Status: " + searchResponse.status);
    }
    const searchJSON = await searchResponse.json();
    createSearchResults(searchJSON);
  } catch (err) {
    // handle errors
    console.log("Error: ", err);
  }
};

// search lat and lon
const getLatLon = async (searchTerm) => {
  try {
    const url = `https://api.weatherapi.com/v1/search.json?key=922b671388894582ab8201238232504&q=${searchTerm}`;
    const response = fetch(url, { mode: "cors" });
    const searchResponse = await response;
    if (!searchResponse.ok) {
      throw new Error("HTTP Status: " + searchResponse.status);
    }
    const searchJSON = await searchResponse.json();
    const firstItem = searchJSON[0];
    if (firstItem.lat || firstItem.lon) {
      let latLon = `${firstItem.lat},${firstItem.lon}`;
      localStorage.setItem("location", latLon);
      getForecast(latLon);
    } else {
      return;
    }
  } catch (err) {
    // handle errors
    return;
  }
};

export const createSearchResults = (searchArr) => {
  clearElement(searchResults);
  if (searchArr.length === 0) {
    // create search result for empty search array
    const searchResult = document.createElement("div");
    searchResult.classList.add("empty-results");

    // create search result title for empty search array
    const searchTitle = document.createElement("div");
    searchTitle.classList.add("search-title");
    searchTitle.textContent = "No Locations Found";

    // create search result subtitle for empty search array
    const searchSubTitle = document.createElement("div");
    searchSubTitle.classList.add("search-subtitle");
    searchSubTitle.textContent = "Enter a valid City or ZIP Code";

    // append title and subtitle to empty results
    searchResult.append(searchTitle, searchSubTitle);

    // append result to empty results container
    searchResults.appendChild(searchResult);
  }

  searchArr.forEach((searchItem) => {
    // create search result
    const searchResult = document.createElement("div");
    searchResult.classList.add("search-result");

    // create search result title
    const searchTitle = document.createElement("div");
    searchTitle.classList.add("search-title");
    searchTitle.textContent = searchItem.name;

    // create search result subtitle
    const searchSubTitle = document.createElement("div");
    searchSubTitle.classList.add("search-subtitle");
    searchSubTitle.textContent = `${
      searchItem.region === "" ? searchItem.name : searchItem.region
    }, ${
      searchItem.country === "United States of America" ||
      searchItem.country === "USA"
        ? "US"
        : searchItem.country
    }`;

    // append title and subtitle to result
    searchResult.append(searchTitle, searchSubTitle);

    // append result to results container
    searchResults.appendChild(searchResult);

    // add event listener for each suggested search result
    searchResult.addEventListener("click", () => {
      const latLong = `${searchItem.lat},${searchItem.lon}`;
      localStorage.setItem("location", latLong);
      getForecast(latLong);
      searchInput.value = "";
      clearElement(searchResults);
    });
  });
};

export const clearElement = (elem) => {
  if (elem != null) {
    while (elem.firstChild) {
      elem.removeChild(elem.firstChild);
    }
  }
};

document.addEventListener("click", (e) => {
  if (!searchBox.contains(e.target)) {
    clearElement(searchResults);
    searchInput.value = "";
  }
});

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const location = searchInput.value;
  if (location.length === 0) return;
  getLatLon(location);
  searchInput.value = "";
  searchInput.blur();
  clearElement(searchResults);
});

// wait 1 second before calling callback (for search input)
const debounce = (cb, delay = 300) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      cb(...args);
    }, delay);
  };
};

const searchInputDebounce = debounce((text) => getSearchData(text));

searchInput.addEventListener("input", (e) => {
  let inputValue = e.target.value;
  searchInputDebounce(inputValue);
});
