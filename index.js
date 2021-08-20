import images from "./data/images.js";
import createDivElement from "./src/createDivElements.js";

("use strict");

const key = "",
  weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  chartData = {
    label: [],
    value: [],
    humidity: [],
    feels: [],
    clouds: [],
  };

let cityId,
  searchInput,
  container,
  weatherData,
  ctx,
  chartButtons,
  cities,
  chartContainer,
  chartConfiguration,
  chartOptions,
  form,
  arrayOfDisplayKeys = [],
  searchList,
  searchListItems,
  chartLegend,
  endpointId = `https://api.openweathermap.org/data/2.5/forecast?id=${cityId}&appid=${key}`;
//===============================================================================================================

let currentDate = new Date(),
  currentDisplayDate = new Date(),
  currentDisplayKey = `KEY${currentDisplayDate.getDate()}${currentDisplayDate.getMonth()}${currentDisplayDate.getFullYear()}`,
  currentDisplayIndex = 0;
//===============================================================================================================

//GET CITY LIST FROM JSON FILE
fetch("../data/city_list_min.json", { mode: "no-cors" })
  .then((resp) => resp.json())
  .then(
    (data) =>
      (cities = data.map((item) => {
        return {
          name: item.name,
          id: item.id,
          country: item.country,
          state: item.state ? item.state : null,
        };
      }))
  )
  .then(() => console.log(cities))
  .then(() => displaySheet()) //DISPLAY EVERYTHING AFTER FETCHING CITIES LIST
  .catch(() => {});

//GET 5 DAYS WEATHER DATA FROM OPENWEATHERMAP API
const getChartWeatherData = () => {
  fetch(endpointId)
    .then((resp) => resp.json())
    //.then((data) => console.log(data))
    .then((data) => (weatherData = getApiValues(data)))
    .then(() => prepareChartData(currentDisplayKey))
    .then(() => drawChart(chartData))
    .then(() => weatherUpdate())

    .catch(() => {});
};
//===============================================================================================================
const getApiValues = (weatherData) => {
  console.log(weatherData);
  let isFirst = true,
    actualWeather;
  const formattedForecasts = {};

  const { list: listOfForecasts } = weatherData; //DESTRUCTURING!!!!!!!

  for (let forecast of listOfForecasts) {
    const formattedForecast = {
      date: new Date(forecast.dt * 1000),
      feels: Math.round((forecast.main.feels_like + -273.15) * 10) / 10,
      temp: Math.round((forecast.main.temp + -273.15) * 10) / 10,
      pressure: forecast.main.pressure,
      humidity: forecast.main.humidity,
      clouds: forecast.clouds.all,
      windDeg: forecast.wind.deg,
      windSpeed: forecast.wind.speed,
    };
    if (isFirst) {
      actualWeather = {
        date: new Date(forecast.dt * 1000),
        temp: {
          desc: "now",
          value: Math.round((forecast.main.temp + -273.15) * 10) / 10,
          unit: "\xB0C",
        },
        pressure: {
          desc: "pressure",
          value: forecast.main.pressure,
          unit: "hPa",
        },
        humidity: {
          desc: "humidity",
          value: forecast.main.humidity,
          unit: "%",
        },
        windspeed: {
          desc: "wind speed",
          value: forecast.wind.speed,
          unit: "km/h",
        },
        windDeg: {
          desc: "wind direction",
          value: forecast.wind.deg,
          unit: "deg",
        },
        clouds: {
          desc: "clouds",
          value: forecast.clouds.all,
          unit: "%",
        },
        feels: {
          desc: "feels",
          value: Math.round((forecast.main.feels_like + -273.15) * 10) / 10,
          unit: "\xB0C",
        },
      };
      isFirst = false;
    }

    const forecastKey = `KEY${formattedForecast.date.getDate()}${formattedForecast.date.getMonth()}${formattedForecast.date.getFullYear()}`;
    if (typeof formattedForecasts[forecastKey] === "undefined") {
      formattedForecasts[forecastKey] = [];
    }
    formattedForecasts[forecastKey].push(formattedForecast);
    if (arrayOfDisplayKeys.indexOf(forecastKey) == -1) {
      arrayOfDisplayKeys.push(`${forecastKey}`); //ARRAT+Y OF INDEXES NEEDED FOR CHART UPDATING
    }
  }
  return {
    name: weatherData.city.name,
    id: weatherData.city.id,
    actual: actualWeather,
    list: formattedForecasts,
  };
};

export default getApiValues;

//====================================================================================

function displaySheet() {
  console.log("display Sheet");
  let header, content, cityTag, dateTag, tempTag, pressureTag, humidityTag, windSpeedTag, clouds;

  let weatherDataTags = [
    (tempTag = createDivElement(true, "temp")),
    (pressureTag = createDivElement(false, "pressure")),
    (humidityTag = createDivElement(false, "humidity")),
    (windSpeedTag = createDivElement(false, "windspeed")),
  ];

  header = document.createElement("div");
  content = document.createElement("div");
  cityTag = document.createElement("h1");
  dateTag = document.createElement("h2");
  clouds = document.createElement("img");

  header.classList.add("header");
  content.classList.add("content");
  cityTag.classList.add("header__city");
  dateTag.classList.add("header__date");
  clouds.classList.add("content__clouds");
  clouds.setAttribute("data-name", "clouds");
  cityTag.innerHTML = "Select a city";

  header.classList.add("header");
  content.classList.add("content");
  cityTag.classList.add("header__city");
  dateTag.classList.add("header__date");
  clouds.classList.add("content__clouds");

  container.appendChild(header);
  container.appendChild(content);
  header.appendChild(cityTag);
  header.appendChild(dateTag);
  for (let weatherDataTag of weatherDataTags) {
    content.appendChild(weatherDataTag);
  }
  content.appendChild(clouds);
}
//======================================================================================

function weatherUpdate() {
  console.log("weatherUpdate");
  let { actual: actualWeatherData } = weatherData;

  let content = document.querySelector(".content");
  let header = document.querySelector(".header");
  let clouds = document.querySelector(".content__clouds");

  let cloudSrc = () => {
    if (actualWeatherData.clouds.value <= 25) {
      return images.clouds.sunny;
    } else if (actualWeatherData.clouds.value <= 50) {
      return images.clouds.partly_cloud;
    } else if (actualWeatherData.clouds.value <= 75) {
      return images.clouds.mostly_cloud;
    } else return images.clouds.full_clouds;
  };
  let dateText = `${weekday[currentDate.getDay()]},${currentDate.getDate()}-${
    currentDate.getMonth() + 1
  }-${currentDate.getFullYear()}`;

  header.childNodes[0].innerHTML = weatherData.name;
  header.childNodes[1].innerHTML = dateText;
  clouds.src = cloudSrc();

  content.style.display = "grid";
  content.childNodes.forEach((item) => {
    let elemName = item.dataset.name;
    item.childNodes[0].innerHTML = actualWeatherData[`${elemName}`].desc;
    item.childNodes[1].innerHTML = `${
      actualWeatherData[`${elemName}`].value
    }<span class="content__unit">${actualWeatherData[`${elemName}`].unit}</span>`;
  });
}
//======================================================================================
function prepareChartData(currentKey) {
  console.log("prepare chart data");
  const { list: listOfForecasts } = weatherData;

  for (let dataItem in chartData) {
    chartData[dataItem] = [];
  }

  for (let forecast of listOfForecasts[currentKey]) {
    chartData["label"].push(
      forecast.date.getHours() < 10
        ? `0${forecast.date.getHours()}:00`
        : `${forecast.date.getHours()}:00`
    );
    chartData["value"].push(forecast.temp);
    chartData["humidity"].push(forecast.humidity);
    chartData["feels"].push(forecast.feels);
    chartData["clouds"].push(forecast.clouds);
  }
  chartData["date"] = listOfForecasts[currentKey][0].date;
}

//======================================================================================
function drawChart(dataToDisplay) {
  chartLegend.innerHTML = `${currentDate.getDate()}-${
    currentDate.getMonth() + 1
  }-${currentDate.getFullYear()}`;
  chartContainer.style.display = "block";
  console.log("draw Chart");
  console.log(dataToDisplay);
  ctx = document.getElementById("chart").getContext("2d");
  chartConfiguration = {
    labels: dataToDisplay.label,
    datasets: [
      {
        label: "Temperature",
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgb(54, 162, 235)",
        data: dataToDisplay.value,
        fill: false,
      },
    ],
  };
  chartOptions = {
    responsive: true,
    tooltips: {
      enabled: true,
      titleFontSize: 15,
      titleAlign: "center",
    },
  };
  window.myLineChart = new Chart(ctx, {
    type: "line",
    data: chartConfiguration,
    options: chartOptions,
  });
}

//=====================================================================================
function updateChartData(e) {
  if (e.target.dataset["direct"] === "left") {
    currentDisplayIndex--;
  } else if (e.target.dataset["direct"] === "right") {
    currentDisplayIndex++;
  }

  if (currentDisplayIndex === 0) {
    chartButtons[0].disabled = true; //left
  } else if (currentDisplayIndex === arrayOfDisplayKeys.length - 1) {
    chartButtons[1].disabled = true; //right
  } else {
    chartButtons[0].disabled = false; //left
    chartButtons[1].disabled = false; //right
  }

  if (arrayOfDisplayKeys[currentDisplayIndex] !== "undefined") {
    prepareChartData(arrayOfDisplayKeys[currentDisplayIndex]);
    chartLegend.innerText = `${chartData.date.getDate()}-${
      chartData.date.getMonth() + 1
    }-${chartData.date.getFullYear()}`;
    chartConfiguration.labels = [];
    chartConfiguration.datasets[0].data = [];
    chartConfiguration.labels.push(...chartData.label);
    chartConfiguration.datasets[0].data.push(...chartData.value);

    window.myLineChart.update();
  }
  //
}

//=====================================================================================

function submitFn(e) {
  e.preventDefault();
  cityId = searchList.childNodes[1].dataset.id;
  currentDisplayIndex = 0;
  chartButtons[0].disabled = true;
  chartButtons[1].disabled = false;

  endpointId = `https://api.openweathermap.org/data/2.5/forecast?id=${cityId}&appid=${key}`;

  getChartWeatherData();
}

function findMatchCities(wordToMatch, cities) {
  while (wordToMatch && wordToMatch.length > 1) {
    return cities.filter((city) => {
      const regex = new RegExp("^" + wordToMatch, "gi");
      return city.name.match(regex);
    });
  }
}

function displayMatchCities() {
  if (this.value.length > 2) {
    const matchCityArray = findMatchCities(this.value, cities);
    const citiesToDisplay = matchCityArray
      .map((city) => {
        const nameOfCity = city.name;
        const countrySign = city.country;
        const cityState = city.state;
        const cityId = `${city.id}`;
        let innerText;
        cityState !== null
          ? (innerText = `
      <li class="searchbar__list__elem" data-id="${cityId}"> ${nameOfCity
              .charAt(0)
              .toUpperCase()}${nameOfCity.slice(1)},
        <span class="searchbar__list__elem--bold">${countrySign}</span>, ${cityState} </li>
      `)
          : (innerText = `
      <li class="searchbar__list__elem" data-id="${cityId}"> ${
              nameOfCity.charAt(0).toUpperCase() + nameOfCity.slice(1)
            }, <span class="searchbar__list__elem--bold">${countrySign}</span> </li>`);

        return innerText;
      })

      .join("");

    searchList.innerHTML = citiesToDisplay;
    currentDisplayIndex = 0;
    searchListItems = document.querySelectorAll("#searchlist li");

    searchListItems.forEach((listItem) => {
      listItem.addEventListener("click", (e) => {
        currentDisplayIndex = 0;
        chartButtons[0].disabled = true;
        chartButtons[1].disabled = false;
        console.log(e.target.dataset["id"]);
        cityId = parseInt(e.target.dataset["id"], 10);

        endpointId = `https://api.openweathermap.org/data/2.5/forecast?id=${cityId}&appid=${key}`;
        getChartWeatherData();
      });
    });
  } else {
    searchList.innerHTML = "";
  }
}

function clearSearchList() {
  console.log("click");
}
//=====================================================================================
window.addEventListener("DOMContentLoaded", () => {
  form = document.getElementById("form");
  searchInput = document.getElementById("search");
  searchList = document.getElementById("searchlist");
  chartContainer = document.getElementById("chartcontainer");
  container = document.getElementById("container");
  chartLegend = document.querySelector(".chart__legend");

  chartButtons = document.querySelectorAll(".chart__btn");
  form.addEventListener("submit", submitFn);
  chartButtons.forEach((button) => button.addEventListener("click", updateChartData));
  searchInput.addEventListener("change", displayMatchCities);
  searchInput.addEventListener("keyup", displayMatchCities);
  searchInput.addEventListener("onmouseout", clearSearchList);
});
