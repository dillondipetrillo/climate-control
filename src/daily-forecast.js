import { clearElement } from "./request-utils";
import { tempTypeStorage } from "./main-grid";

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

const dailyForecast = document.querySelector(".daily-forecast");
const arrowIcons = document.querySelectorAll(".daily-forecast-btns i");

// global variables for scrolling and carousel
let firstItem;

export const createDailyForecast = (locationForecast) => {
  clearElement(dailyForecast);

  const dailyForecastArr = locationForecast.forecastday;
  dailyForecastArr.forEach((day, index) => {
    // create variables needed for text content
    const dailyForecastDate = new Date(`${day.date}T00:00`);
    const dateDayOfMonth = dailyForecastDate.getDate();
    const dateDay = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
    }).format(dailyForecastDate);
    const date = `${dateDay} ${dateDayOfMonth}`;

    const dayOrNightIdx = day.day.condition.icon.indexOf(
      `${day.day.condition.icon.indexOf("day") < 0 ? "night" : "day"}`
    );
    const iconPath = day.day.condition.icon.slice(
      dayOrNightIdx,
      day.day.condition.icon.length
    );

    const highTempText =
      tempTypeStorage === "f" ? day.day.maxtemp_f : day.day.maxtemp_c;

    const lowTempText =
      tempTypeStorage === "f" ? day.day.mintemp_f : day.day.mintemp_c;

    // create DOM elements for daily forecast
    const dailyForecastItem = document.createElement("div");
    dailyForecastItem.classList.add("daily-forecast-item");

    const dailyForecastTitle = document.createElement("p");
    dailyForecastTitle.classList.add("daily-forecast-title");
    dailyForecastTitle.textContent = index === 0 ? "Today" : date;

    const dailyForecastWeather = document.createElement("div");
    dailyForecastWeather.classList.add("daily-forecast-weather");
    const dailyForecastWeatherLeft = document.createElement("div");
    dailyForecastWeatherLeft.classList.add("daily-forecast-weather-left");

    const dailyForecastIcon = document.createElement("div");
    dailyForecastIcon.classList.add("daily-forecast-icon");
    const dailyForecastImg = document.createElement("img");
    dailyForecastImg.src = "./imgs/icons/" + iconPath;

    const dailyForecastTemps = document.createElement("div");
    dailyForecastTemps.classList.add("daily-forecast-temps");
    const highTemp = document.createElement("p");
    highTemp.classList.add("high-temp");
    highTemp.textContent = `${Math.round(highTempText)}\u00B0`;
    const lowTemp = document.createElement("p");
    lowTemp.classList.add("low-temp");
    lowTemp.textContent = `${Math.round(lowTempText)}\u00B0`;

    const dailyForeCastInfo = document.createElement("div");
    dailyForeCastInfo.classList.add("daily-forecast-info");
    const dailyForecastText = document.createElement("p");
    dailyForecastText.classList.add("daily-forecast-text");
    dailyForecastText.textContent = day.day.condition.text;

    const dailyForecastInfoContainer = document.createElement("div");
    dailyForecastInfoContainer.classList.add("daily-forecast-info-container");

    const dailyForecastInfoIcon = document.createElement("div");
    dailyForecastInfoIcon.classList.add("daily-forecast-info-icon");
    const dailyForecastRainIcon = document.createElement("i");
    dailyForecastRainIcon.classList.add("fa-solid", "fa-droplet");

    const dailyPercentRain = document.createElement("div");
    dailyPercentRain.classList.add("daily-percent-rain");
    dailyPercentRain.textContent = `${day.day.daily_chance_of_rain}%`;

    if (index === 0) {
      firstItem = dailyForecastItem;
    }

    dailyForecastItem.setAttribute("draggable", false);

    // append DOM elements
    dailyForecastInfoIcon.appendChild(dailyForecastRainIcon);
    dailyForecastInfoContainer.append(dailyForecastInfoIcon, dailyPercentRain);
    dailyForeCastInfo.append(dailyForecastText, dailyForecastInfoContainer);

    dailyForecastWeatherLeft.append(dailyForecastIcon, dailyForecastTemps);

    dailyForecastIcon.appendChild(dailyForecastImg);
    dailyForecastTemps.append(highTemp, lowTemp);
    dailyForecastWeather.append(dailyForecastWeatherLeft, dailyForeCastInfo);
    dailyForecastItem.append(dailyForecastTitle, dailyForecastWeather);
    dailyForecast.appendChild(dailyForecastItem);
  });
};

// scroll function for hourly weather
let prevPageX, prevScrollLeft;
let isDragging = false;

const dragStart = (e) => {
  isDragging = true;
  prevPageX = e.pageX || e.touches[0].pageX;
  prevScrollLeft = dailyForecast.scrollLeft;
};

const dragging = (e) => {
  if (!isDragging) return;
  e.preventDefault();
  dailyForecast.classList.add("dragging");
  let positionDiff = (e.pageX || e.touches[0].pageX) - prevPageX;
  dailyForecast.scrollLeft = prevScrollLeft - positionDiff;
};

const dragStop = () => {
  isDragging = false;
  dailyForecast.classList.remove("dragging");
};

dailyForecast.addEventListener("mousedown", dragStart);
dailyForecast.addEventListener("touchstart", dragStart);

dailyForecast.addEventListener("mousemove", dragging);
dailyForecast.addEventListener("touchmove", dragging);

dailyForecast.addEventListener("mouseup", dragStop);
dailyForecast.addEventListener("mouseleave", dragStop);
dailyForecast.addEventListener("touchend", dragStop);

arrowIcons.forEach((icon) => {
  icon.addEventListener("click", () => {
    let firstItemWidth =
      +firstItem.getBoundingClientRect().width.toFixed(1) + 5;
    dailyForecast.scrollLeft +=
      icon.id === "left" ? -firstItemWidth : firstItemWidth;
  });
});
