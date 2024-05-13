/*!
 * Copyright 2020 city-watch.ca
 */

import {Service} from 'typedi';
import {LoggerInterface, LogInjector} from '../../decorators/logger';
import {env} from '../../env';
import axios from 'axios';
import cheerio from 'cheerio';
import {City} from '../models/city';
import {HistoricalWeather} from '../models/historical-weather';

@Service()
export class WeatherService {

    constructor(
        @LogInjector(__filename, ['weather']) private readonly log: LoggerInterface
    ) {
        this.log.debug('Starting weather service', env.openWeather.key);
    }

    private static readonly weatherUrlTemplate = (lat, lon) => `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${env.openWeather.key}`;

    async getWeather(city: City): Promise<Partial<HistoricalWeather>> {
        const {data} = await axios.get(
            WeatherService.weatherUrlTemplate(city.lat, city.lon)
        );
        return {
            temp: WeatherService.kelvinToCelsius(data.main.temp),
            tempMin: WeatherService.kelvinToCelsius(data.main.temp_min),
            tempMax: WeatherService.kelvinToCelsius(data.main.temp_max),
            feelsLike: WeatherService.kelvinToCelsius(data.main.feels_like),
            pressure: data.main.pressure,
            humidity: data.main.humidity,
            visibility: data.visibility,
            windSpeed: data.wind.speed,
            windDirection: data.wind.deg,
            condition: data.weather[0].main,
            conditionDescription: data.weather[0].description,
        };
    }

    async getYesterdayWeather(city: City): Promise<Partial<HistoricalWeather>> {
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterdayTimestamp = Math.floor(yesterdayDate.getTime() / 1000); // Convert to Unix timestamp
    
        const yesterdayWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&start=${yesterdayTimestamp-86400}&appid=${env.openWeather.key}`;
    
        try {
            const { data } = await axios.get(yesterdayWeatherUrl);
            return {
                temp: WeatherService.kelvinToCelsius(data.main.temp),
                tempMin: WeatherService.kelvinToCelsius(data.main.temp_min),
                tempMax: WeatherService.kelvinToCelsius(data.main.temp_max),
            };
        } catch (error) {
            console.error("Error fetching yesterday's weather:", error);
            throw error; // Handle the error as appropriate
        }
    }

    private static kelvinToCelsius(k: number) {
        return parseFloat((k - 273.15).toPrecision(2));
    }

    async scrapeSite2(): Promise<string> {
        try {
            const response = await axios.get("https://scrapeme.live/shop/");
            const html = response.data;
            console.log(html);
            return html;
        } catch (error) {
            console.error("Error scraping site:", error);
            throw error; // Handle the error as appropriate
        }
    }
    async scrapeSite(day: number): Promise<string | undefined> {
        try {
          const { data } = await axios.get('https://climate.weather.gc.ca/climate_data/daily_data_e.html?StationID=48649&timeframe=2&StartYear=1840&EndYear=2022&type=bar&MeasTypeID=heatingdegreedays&time=LST&Day=24&Year=2024&Month=4#');
          const $ = cheerio.load(data);
      
          // Select the second row (assuming the target data is in the second row)
          const secondRow = $(`tr:nth-child(${day})`);
      
          // Check if the row exists
          if (secondRow.length === 0) {
            console.error('Target row not found in the HTML');
            return;
          }
      
          // Find the fifth table cell (assuming the target data is in the fifth cell)
          const targetCell = secondRow.find('td:nth-child(5)');
      
          // Check if the cell exists
          if (targetCell.length === 0) {
            console.error('Target cell not found in the second row');
            return;
          }
      
          // Extract the text content
          const targetValue = targetCell.text().trim();
      
          console.log('Target data:', targetValue);
          return targetValue;
        } catch (error) {
          console.error('Error scraping data:', error);
        }
      }


}

