import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Map, Match } from 'src/database/entities';
import { Repository } from 'typeorm';

@Injectable()
export class MapSeeder {
    constructor(
        @InjectRepository(Map) private readonly mapRepository: Repository<Map>
    ) { }

    async seed(numberOfRows: number, matches: Match[]) {
        const isSeeded = await this.mapRepository.findOne();

        if (isSeeded) {
            // TODO: add logger
            console.log(`"Map" table seems to be seeded...`);
            return;
        }

        console.log(`Seeding "Map" table...`);
        const createdMaps = [];

        for (let i = 0; i < numberOfRows; ++i) {
            const map: Partial<Map> = {
                //mapResult: `1st team win`,
                match: matches[i],
            };
            const newMap = await this.mapRepository.create(map);
            createdMaps.push(newMap);
            await this.mapRepository.save(newMap);
        }
        return createdMaps;
    }
}
