import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { Tournament } from 'src/database/entities';
import { CreateSuspensionDto } from 'src/modules/suspensions/dto/create-suspension.dto';
import { CreateTournamentDto } from 'src/modules/tournaments/dto/create-tournament.dto';

@Injectable()
export class DateValidationPipe implements PipeTransform {
    async transform(value: any, { metatype }: ArgumentMetadata) {
        if (metatype === CreateTournamentDto) {
            const tournamentDto: Tournament = plainToClass(metatype, value);
            const registerStartDate = new Date(tournamentDto.registerStartDate);
            const registerEndDate = new Date(tournamentDto.registerEndDate);
            const startDate = new Date(tournamentDto.tournamentStartDate);
            const breakDate = new Date(registerEndDate);
            breakDate.setMinutes(breakDate.getMinutes() + 40);
            if (registerStartDate < new Date()) {
                throw new BadRequestException(`Registration start date cannot be in the past`);
            }
            if (registerStartDate > registerEndDate) {
                throw new BadRequestException(`Registration end date must be after it's beginning`);
            }
            if (startDate < new Date()) {
                throw new BadRequestException(`Tournament start date cannot be in the past`);
            }
            if (breakDate > startDate) {
                throw new BadRequestException(
                    `Registration must end at least 40 minutes before the start of tournament`,
                );
            }
        }
        if (metatype === CreateSuspensionDto) {
            const suspensionDto = plainToClass(metatype, value);
            if (new Date(suspensionDto.endDate) < new Date()) {
                throw new BadRequestException(`Suspension end date cannot be in the past`);
            }
        }
        return value;
    }
}
