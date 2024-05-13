/*!
 * Copyright 2020 city-watch.ca
 */

import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import * as path from 'path';
import { EnvHelpers } from './util/env-helpers';

// pretty little env file with mappings for improved autocomplete in ts

dotenv.config({path: path.join(process.cwd(), `.env${((process.env.NODE_ENV === 'test') ? '.test' : '')}`)});

/**
 * Environment variable loader and object literal for improved auto-complete
 */
export const env = {
    node: process.env.NODE_ENV || 'development',
    isProduction: EnvHelpers.getOsEnv('PRODUCTION') === 'false',
    isTest: process.env.NODE_ENV === 'test',
    logLevel: EnvHelpers.getOsEnv('LOG_LEVEL'),
    app: {
        name: EnvHelpers.getOsEnv('APP_NAME'),
        version: EnvHelpers.getOsEnv('APP_VERSION'),
        description: EnvHelpers.getOsEnv('APP_DESCRIPTION'),
        host: EnvHelpers.getOsEnv('APP_HOST'),
        schema: EnvHelpers.getOsEnv('APP_SCHEMA'),
        routePrefix: EnvHelpers.getOsEnv('APP_ROUTE_PREFIX'),
        port: EnvHelpers.normalizePort(process.env.PORT || EnvHelpers.getOsEnv('APP_PORT')),
        publicPort: EnvHelpers.normalizePort(EnvHelpers.getOsEnv('APP_PUBLIC_PORT') || process.env.PORT),
        dirs: {
            loaders: [path.join(__dirname, './loaders/*.loader.{ts,js}')],
            entities: [path.relative(path.join(process.cwd()), path.join(__dirname, './api/models/*.{ts,js}'))],
            subscribers: [path.join(__dirname, './api/subscribers/*.subscriber.{ts,js}')],
            services: [path.join(__dirname, './api/services/*.service.{ts,js}')],
            controllers: [path.join(__dirname, './api/controllers/*.controller.{ts,js}')],
            middlewares: [path.join(__dirname, './middleware/*.middleware.{ts,js}')],
            cronJobs: [path.join(__dirname, './api/jobs/*.job.{ts,js}')],
        },
        jwt: {
            key: readFileSync(EnvHelpers.getOsEnv('APP_JWT_KEY')).toString(),
        },
        front: {
            url: EnvHelpers.getOsEnv('APP_FRONT_URL'),
        },
    },
    database: {
        type: EnvHelpers.getOsEnv('DATABASE_TYPE'),
        host: EnvHelpers.getOsEnv('DATABASE_HOST'),
        port: EnvHelpers.toNumber(EnvHelpers.getOsEnv('DATABASE_PORT')),
        username: EnvHelpers.getOsEnv('DATABASE_USERNAME'),
        password: EnvHelpers.getOsEnv('DATABASE_PASSWORD'),
        database: EnvHelpers.getOsEnv('DATABASE_DATABASE'),
        
    
    },
    swagger: {
        route: EnvHelpers.getOsEnv('SWAGGER_ROUTE'),
        enabled: EnvHelpers.getOsEnv('SWAGGER_ENABLED'),
    },
    openWeather: {
        key: EnvHelpers.getOsEnv('OPEN_WEATHER_API_KEY'),
    }
};
