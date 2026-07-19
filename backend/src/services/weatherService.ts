import fetch from 'node-fetch';
import { env } from '../config/env';

export interface WeatherSnapshot {
  tempC: number;
  feelsLikeC: number;
  condition: string; // e.g. "Clear", "Rain"
  description: string;
  humidity: number;
  windSpeed: number;
  city: string;
}

/** Fetches current weather for a city using the OpenWeather API. */
export async function getCurrentWeather(city: string): Promise<WeatherSnapshot> {
  if (!env.OPENWEATHER_API_KEY) {
    // Reasonable stub so the rest of the app keeps working without a key.
    return {
      tempC: 22,
      feelsLikeC: 22,
      condition: 'Clear',
      description: 'clear sky (stub - configure OPENWEATHER_API_KEY)',
      humidity: 50,
      windSpeed: 3,
      city,
    };
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&units=metric&appid=${env.OPENWEATHER_API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`OpenWeather API error (${res.status})`);
  }
  const data: any = await res.json();

  return {
    tempC: data.main.temp,
    feelsLikeC: data.main.feels_like,
    condition: data.weather[0].main,
    description: data.weather[0].description,
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
    city: data.name,
  };
}

/** Recommends fabrics/colors/shoes/layers based on a weather snapshot. */
export function recommendForWeather(weather: WeatherSnapshot) {
  const { tempC, condition } = weather;
  const recs = {
    fabrics: [] as string[],
    colors: [] as string[],
    shoes: [] as string[],
    layers: [] as string[],
  };

  if (tempC <= 5) {
    recs.fabrics.push('wool', 'fleece', 'thermal');
    recs.colors.push('charcoal', 'deep burgundy', 'navy');
    recs.shoes.push('insulated boots');
    recs.layers.push('thermal base layer', 'heavy coat', 'scarf');
  } else if (tempC <= 15) {
    recs.fabrics.push('wool blend', 'denim', 'corduroy');
    recs.colors.push('mustard', 'olive', 'rust');
    recs.shoes.push('leather boots', 'sneakers');
    recs.layers.push('sweater', 'light jacket');
  } else if (tempC <= 24) {
    recs.fabrics.push('cotton', 'linen blend');
    recs.colors.push('soft pastels', 'earth tones');
    recs.shoes.push('loafers', 'sneakers');
    recs.layers.push('light cardigan');
  } else {
    recs.fabrics.push('linen', 'cotton', 'breathable synthetics');
    recs.colors.push('white', 'sky blue', 'pale lavender');
    recs.shoes.push('sandals', 'canvas sneakers');
    recs.layers.push('none needed');
  }

  if (/rain|drizzle|thunderstorm/i.test(condition)) {
    recs.shoes = ['waterproof boots'];
    recs.layers.push('waterproof jacket');
  }
  if (/snow/i.test(condition)) {
    recs.shoes = ['snow boots'];
    recs.layers.push('insulated parka');
  }

  return recs;
}
