import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Preset } from 'src/entities';
import { Repository } from 'typeorm';
import * as faker from 'faker';

@Injectable()
export class PresetsSeeder {
    constructor(@InjectRepository(Preset) private readonly presetsRepository: Repository<Preset>) {}

    async seed(numberOfRows: number) {
        const isSeeded = await this.presetsRepository.findOne();

        if (isSeeded) {
            // TODO: add logger
            console.log(`"Preset" table seems to be seeded...`);
            return;
        }

        console.log(`Seeding "Preset" table...`);

        for (let i = 0; i < numberOfRows; ++i) {
            const preset: Partial<Preset> = {
                mapName: faker.name.findName(),
                pickRules: faker.lorem.sentences(5),
                spectatorRules: faker.lorem.sentences(5),
            };
            const newPreset = await this.presetsRepository.create(preset);
            await this.presetsRepository.save(newPreset);
        }
    }
}
