/*!
 * Copyright 2020 city-watch.ca
 */

// general helper functions for the env loader

export class EnvHelpers {
    static getOsEnv(key: string): string {
        
        if (typeof process.env[key] === 'undefined') {
            throw new Error(`Environment variable ${key} is not set.`);
        }
        return process.env[key] as string;
    }

    static toNumber(val: string): number {
        return parseInt(val, 10);
    }

    static normalizePort(port: string): number {
        const parsedPort = parseInt(port, 10);
        if (parsedPort >= 0) {
            return parsedPort;
        }
        return null;
    }
}
