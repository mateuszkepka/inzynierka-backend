import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Format } from 'src/entities';
import { Repository } from 'typeorm';
import * as faker from 'faker';

@Injectable()
export class PresetsSeeder {
    constructor(@InjectRepository(Format) private readonly presetsRepository: Repository<Format>) {}

    async seed(numberOfRows: number) {
        const isSeeded = await this.presetsRepository.findOne();

        if (isSeeded) {
            // TODO: add logger
            console.log(`"Preset" table seems to be seeded...`);
            return;
        }

        console.log(`Seeding "Preset" table...`);

        const createdPresets = [];

        for (let i = 0; i < numberOfRows; ++i) {
            const preset: Partial<Format> = {
                // mapName: faker.name.findName(),
                // pickRules: faker.lorem.sentences(5),
                // spectatorRules: faker.lorem.sentences(5),
            };
            const newPreset = await this.presetsRepository.create(preset);
            createdPresets.push(newPreset);
            await this.presetsRepository.save(newPreset);
        }

        return createdPresets;
    }
}
