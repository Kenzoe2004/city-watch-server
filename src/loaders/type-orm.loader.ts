/*!
 * Copyright 2020 city-watch.ca
 */

import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { ConnectionOptions, createConnection } from 'typeorm';
import { env } from '../env';
import { Logger } from '../util/logger';

export const TypeOrmLoader: MicroframeworkLoader = async (settings: MicroframeworkSettings | undefined) => {
    const log = new Logger(__filename, ['ORM']);

    log.info('[START] Loading ORM');

    const options: ConnectionOptions = {
        type: env.database.type as any,
        host: env.database.host,
        port: env.database.port,
        username: env.database.username,
        password: env.database.password,
        database: env.database.database,
        ssl: { rejectUnauthorized: false }, 
        entities: env.app.dirs.entities,
      };
    const connection = await createConnection(options);

    if (settings) {
        settings.setData('connection', connection);
        settings.onShutdown(() => connection.close());
    }
};
