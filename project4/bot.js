require("dotenv").config();

const m = require("masto");

const masto = m.createRestAPIClient({
  url: "https://networked-media.itp.io",
  accessToken: process.env.TOKEN,
});

// creating a const for weather with the pre-existing weather codes from open-meteo.com
const weather = {
  0: "clear ☀️",
  1: "mainly clear 🌤️",
  2: "partly cloudy ⛅️",
  3: "cloudy ☁️",
  45: "foggy 🌫️",
  51: "drizzling 🌧️",
  53: "moderately drizzling 🌧️",
  55: "densely drizzling 🌧️",
  61: "lightly raining 🌧️",
  63: "raining ☔️",
  65: "heavy rain ☔️",
  66: "light freezing rain 🌧️",
  67: "heavy freezing rain 🌧️",
  71: "flurries 🌨️",
  73: "snowing ❄️",
  75: "heavy snow ☃️",
  80: "slight rain showers 🌧️",
  81: "moderate rain showers 🌧️",
  82: "heavy rain showers ⛈️",
  95: "thunderstorms 🌩️",
};

const NYCTime = (timeString) => {
  return new Date(timeString).toLocaleTimeString("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// i wanted the hashtags to vary based on the weather, so i found this
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_operator
const getHashtag = (condition) => {
  if (condition.includes('clear')) {
    return "#clearskies";
  } else if (condition.includes('cloudy')) {
    return "#cloudwatch";
  } else if (condition.includes('drizzle') || condition.includes('rain')) {
    return "#rainwatch";
  } else if (condition.includes('snow') || condition.includes('flurries')) {
    return "#snowday";
  } else if (condition.includes('foggy')) {
    return "#foggy";
  } else if (condition.includes('thunderstorm')) {
    return "#stormwatch";
  } else {
    return "#nycskies";
  }
};

const getWeatherData = async () => {
  // this link is from open-meteo.com after i selected the boundaries i wanted for the weather
  // i feel like they could've made the link wayyyyyyy shorter or condensed, like in a pretty way
  let url =
    "https://api.open-meteo.com/v1/forecast?latitude=40.7143&longitude=-74.006&daily=weather_code,sunrise,sunset&hourly=temperature_2m&current=temperature_2m,apparent_temperature,wind_speed_10m,precipitation,rain,showers,snowfall,weather_code&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch";

//  take open meteo data and round numbers!
  let response = await fetch(url);
  let data = await response.json();

  return {
    temperature: Math.round(data.current.temperature_2m),
    feelsLike: Math.round(data.current.apparent_temperature),
    precipitation: Number(data.current.precipitation).toFixed(2),
    rain: Number(data.current.rain).toFixed(2),
    showers: Number(data.current.showers).toFixed(2),
    snow: Number(data.current.snowfall).toFixed(2),
    wind: Math.round(data.current.wind_speed_10m),
    condition: weather[data.current.weather_code] || "unusual conditions",
    sunrise: NYCTime(data.daily.sunrise[0]),
    sunset: NYCTime(data.daily.sunset[0]),
  };
};

// build the actual ost format, i thought the angel wings would be way cute than a boring bullet point, maybe a star might be better
// but ill circle back later
const makePost = (weather) => {
  let hashtag = getHashtag(weather.condition);
  let bullet = "꒰ྀི১ ໒꒱ིྀ";
  let post = "";

// i learned about \n for a new line when im formatting:
// https://www.geeksforgeeks.org/javascript/how-to-create-a-new-line-in-javascript/
  post += bullet + " nyc - " + weather.condition + ", " + weather.temperature + "f\n";
  post += bullet + " feels like - " + weather.feelsLike + "f\n";
  post += bullet + " wind - " + weather.wind + " mph\n";

  if (Number(weather.rain) > 0) {
    post += bullet + " rain - " + weather.rain + "in\n";
  }
  if (Number(weather.showers) > 0) {
    post += bullet + " showers - " + weather.showers + "in\n";
  }
  if (Number(weather.snow) > 0) {
    post += bullet + " snow - " + weather.snow + "in\n";
  }
  if (Number(weather.precipitation) > 0) {
    post += bullet + " total precipitation - " + weather.precipitation + "in\n";
  }

  post += bullet + " sunrise - " + weather.sunrise.toLowerCase() + "\n";
  post += bullet + " sunset - " + weather.sunset.toLowerCase() + "\n";
  post += bullet + " " + hashtag.toLowerCase();
  // kinda just wanted everything to be lowercase since i like typing lowercase on texts
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLowerCase
  return post;
};

const makeStatus = async () => {
  let weatherNow = await getWeatherData();
  let post = makePost(weatherNow);

  const s = await masto.v1.statuses.create({
    status: post,
    visibility: "public",
  });

  console.log(s.url);
};

makeStatus();
setInterval(makeStatus, 3600000);