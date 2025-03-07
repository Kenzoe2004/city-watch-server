/*!
 * Copyright 2020 city-watch.ca
 */

import { Service } from 'typedi';
import { LoggerInterface, LogInjector } from '../../decorators/logger';
import { env } from '../../env';
import axios from 'axios';
import cheerio from 'cheerio';
import { City } from '../models/city';
import { HistoricalWeather } from '../models/historical-weather';

@Service()
export class WeatherService {

    constructor(
        @LogInjector(__filename, ['weather']) private readonly log: LoggerInterface
    ) {
        this.log.debug('Starting weather service', env.openWeather.key);
    }

    private static readonly weatherUrlTemplate = (lat: number, lon: number) => 
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${env.openWeather.key}`;

    async getWeather(city: City): Promise<Partial<HistoricalWeather>> {
        const { data } = await axios.get(
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
        const yesterdayTimestamp = Math.floor(yesterdayDate.getTime() / 1000);

        const yesterdayWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&start=${yesterdayTimestamp - 86400}&appid=${env.openWeather.key}`;

        try {
            const { data } = await axios.get(yesterdayWeatherUrl);
            return {
                temp: WeatherService.kelvinToCelsius(data.main.temp),
                tempMin: WeatherService.kelvinToCelsius(data.main.temp_min),
                tempMax: WeatherService.kelvinToCelsius(data.main.temp_max),
            };
        } catch (error) {
            this.log.error("Error fetching yesterday's weather:", error);
            throw error; // Handle the error as appropriate
        }
    }

    async getYesterdayAirQuality(city: City): Promise<any> {
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterdayTimestamp = Math.floor(yesterdayDate.getTime() / 1000);

        const airQualityUrl = `http://api.openweathermap.org/data/2.5/air_pollution/history?lat=${city.lat}&lon=${city.lon}&start=${yesterdayTimestamp}&end=${yesterdayTimestamp + 86400}&appid=${env.openWeather.key}`;

        try {
            const { data } = await axios.get(airQualityUrl);
            const airQualityData = data.list[0]; // Assuming the first entry is the correct one

            return {
                aqi: airQualityData.main.aqi, // Air Quality Index (1-5)
                components: {
                    co: airQualityData.components.co, // Carbon Monoxide
                    no: airQualityData.components.no, // Nitrogen Monoxide
                    no2: airQualityData.components.no2, // Nitrogen Dioxide
                    o3: airQualityData.components.o3, // Ozone
                    so2: airQualityData.components.so2, // Sulphur Dioxide
                    pm2_5: airQualityData.components.pm2_5, // Fine particles matter
                    pm10: airQualityData.components.pm10, // Coarse particulate matter
                    nh3: airQualityData.components.nh3, // Ammonia
                }
            };
        } catch (error) {
            this.log.error("Error fetching yesterday's air quality:", error);
            throw error; // Handle the error as appropriate
        }
    }

    private static kelvinToCelsius(k: number): number {
        return parseFloat((k - 273.15).toPrecision(2));
    }

    async scrapeSite(day: number): Promise<string | undefined> {
        try {
            const { data } = await axios.get('https://climate.weather.gc.ca/climate_data/daily_data_e.html?StationID=48649&timeframe=2&StartYear=1840&EndYear=2022&type=bar&MeasTypeID=heatingdegreedays&time=LST&Day=24&Year=2025&Month=1#');
            const $ = cheerio.load(data);
      
            const secondRow = $(`tr:nth-child(${day})`);
      
            if (secondRow.length === 0) {
                this.log.error('Target row not found in the HTML');
                return;
            }
      
            const targetCell = secondRow.find('td:nth-child(5)');
      
            if (targetCell.length === 0) {
                this.log.error('Target cell not found in the second row');
                return;
            }
      
            const targetValue = targetCell.text().trim();
      
            this.log.debug('Target data:', targetValue);
            return targetValue;
        } catch (error) {
            this.log.error('Error scraping data:', error);
        }
    }
}
