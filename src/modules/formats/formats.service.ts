import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Format } from 'src/entities';
import { Repository } from 'typeorm';
import { TournamentFormat } from './dto/tournament-format.enum';

@Injectable()
export class FormatsService {
    constructor(@InjectRepository(Format) private readonly formatsRepository: Repository<Format>) { }

    async getById(formatId: number) {
        const format = await this.formatsRepository.findOne({
            where: { formatId: formatId }
        });
        if (!format) {
            throw new NotFoundException(`Format with this id does not exist`)
        }
        return format;
    }

    async getByName(name: TournamentFormat) {
        const format = await this.formatsRepository.findOne({
            where: { name: name }
        });
        if (!format) {
            throw new NotFoundException(`Format with this name does not exist`)
        }
        return format;
    }

    async getAll() {
        const formats = await this.formatsRepository.find();
        if (formats.length === 0) {
            throw new NotFoundException(`No formats found`);
        }
        return formats;
    }

}
