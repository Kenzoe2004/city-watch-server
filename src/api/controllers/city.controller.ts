/*!
 * Copyright 2020 city-watch.ca
 */

// Test controller
import { Get, JsonController, Param, Post } from 'routing-controllers';
import { WeatherService } from '../services/weather.service';
import { IESOService } from '../services/ieso.service';
import { CityInfoService } from '../services/city-info.service';
import { CityRepository } from '../repositories/city.repository';
import { OrmRepository } from 'typeorm-typedi-extensions';

@JsonController('/city')
export class CityController {
    constructor(
        private weatherService: WeatherService,
        private iesoService: IESOService,
        private cityInfoService: CityInfoService,
        @OrmRepository() private readonly cityRepository: CityRepository,
    ) {}

    @Get('')
    async getAllCities() {
        return this.cityRepository.find();
    }

    @Get('/:id')
    async getCityById(
        @Param('id') id: string,
    ) {
        const city = await this.cityRepository.findOne(id, { relations: ['country', 'dataPoints'] });
        return {
            ...city,
            ...await this.cityInfoService.getCityInfo(city),
            weather: await this.weatherService.getWeather(city),
            power: await this.iesoService.getPowerData(),
            generation: await this.iesoService.getPowerGenerationBreakdown()
        };
    }

    @Get('/:id/wiki')
    async getCityWikiInfoById(
        @Param('id') id: string,
    ) {
        const city = await this.cityRepository.findOne(id);
        return this.cityInfoService.getCityInfo(city);
    }

    @Get('/:id/now')
    async getCityDataNowById(
        @Param('id') id: string,
    ) {
        const city = await this.cityRepository.findOne(id);
        return {
            weather: await this.weatherService.getWeather(city),
            power: await this.iesoService.getPowerData(),
            generation: await this.iesoService.getPowerGenerationBreakdown()
        };
    }

    @Post('/test')
    async test() {
        const city = await this.cityRepository.findOne({ where: { name: 'Oshawa' } });
        return {
            cityInfo: await this.cityInfoService.getCityInfo(city),
            weather: await this.weatherService.getWeather(city),
            power: await this.iesoService.getPowerData(),
            generation: await this.iesoService.getPowerGenerationBreakdown()
        };
    }

    @Get('/:id/yesterday-weather')
    async getYesterdayWeather(
        @Param('id') id: string,
    ) {
        const city = await this.cityRepository.findOne(id);
        if (!city) {
            throw new Error('City not found');
        }
        return {
            weather: await this.weatherService.getYesterdayWeather(city)
        };
    }

    @Get('/:id/yesterday-air-quality')
    async getYesterdayAirQuality(
        @Param('id') id: string,
    ) {
        const city = await this.cityRepository.findOne(id);
        if (!city) {
            throw new Error('City not found');
        }
        return {
            airQuality: await this.weatherService.getYesterdayAirQuality(city)
        };
    }

    @Get('/:id/HDD')
    async getHeatingDegreeDay(
        @Param('id') id: string,
    ) {
        const city = await this.cityRepository.findOne(id);
        if (!city) {
            throw new Error('City not found');
        }
        try {
            const today = new Date().getDate();
            const html = await this.weatherService.scrapeSite(today);
            return {
                HTML: html
            };
        } catch (error) {
            console.error("Error fetching heating degree day:", error);
            throw error; // Handle the error as appropriate
        }
    }
}
