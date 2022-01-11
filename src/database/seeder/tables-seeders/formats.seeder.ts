import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Format } from 'src/entities';

@Injectable()
export class FormatsSeeder {
    constructor(@InjectRepository(Format) private readonly formatsRepository: Repository<Format>) { }

    async seed() {
        const formats = [];
        const singleRobin = this.formatsRepository.create({
            name: `Single Round Robin`,
            description: `System grupowy, gdzie każda drużyna gra z każdą inną dokładnie raz`,
        });
        const doubleRobin = this.formatsRepository.create({
            name: `Double Round Robin`,
            description: `System grupowy, gdzie każda drużyna gra z każdą inną dokładnie 2 razy`
        })
        const singleLadder = this.formatsRepository.create({
            name: `Single Elimination Ladder`,
            description: `System drabinkowy bez drabinki przegranych`
        })
        const doubleLadder = this.formatsRepository.create({
            name: `Double Elimination Ladder`,
            description: `System drabinkowy z drabinką przegranych`
        })
        formats.push(singleRobin, doubleRobin, singleLadder, doubleLadder)
        return this.formatsRepository.save(formats);
    }
}