/*!
 * Copyright 2020 city-watch.ca
 */

import {Service} from 'typedi';
import {LoggerInterface, LogInjector} from '../../decorators/logger';
import {City} from '../models/city';
import wiki from 'wikijs';


@Service()
export class CityInfoService {
    constructor(
        @LogInjector(__filename, ['CI']) private readonly log: LoggerInterface
    ) {
    }

    async getCityInfo(city: City) {
        this.log.debug('city data');
        const x = await wiki({ apiUrl: 'https://en.wikipedia.org/w/api.php'}).page(city.name);
        const summary: string = await x.summary();
        const rawImages: Array<any> = await x.rawImages();
        const fullInfo: any = await x.fullInfo();
        const content: any = await x.content();
        return {
            fullInfo,
            name: fullInfo.general.name,
            officialName: fullInfo.general.officialName,
            motto: fullInfo.general.motto,
            summary,
            image: this.getImage(rawImages, fullInfo.general.imageSkyline, fullInfo.general.image1),
            logo: this.getImage(rawImages, fullInfo.general.imageBlankEmblem, fullInfo.general.imageBlankEmblem),
            population: fullInfo.general.populationTotal,
            website: fullInfo.website,
            content: content.filter(c => !['See also', 'References', 'External links'].map(g => c.title.includes(g)).reduce((a, g) => a || g, false)),
            html: await x.html()
        };
    }

    private getImage(rawImages: Array<any>, name: any, name2: any) {
        return rawImages.filter(image => image.title.includes(name) || image.title.includes(name2)).map(image => image.imageinfo[0]).pop();
    }
}
