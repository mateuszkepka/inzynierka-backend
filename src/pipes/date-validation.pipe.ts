import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateSuspensionDto } from 'src/modules/suspensions/dto/create-suspension.dto';
import { CreateTournamentDto } from 'src/modules/tournaments/dto/create-tournament.dto';

@Injectable()
export class DateValidationPipe implements PipeTransform {
    async transform(value: any, { metatype }: ArgumentMetadata) {
        if (metatype === CreateTournamentDto) {
            const tournamentDto = plainToClass(metatype, value);
            if (new Date(tournamentDto.registerStartDate) < new Date()) {
                throw new BadRequestException(`Register start date cannot be in the past`)
            }
            if (new Date(tournamentDto.registerEndDate) < new Date()) {
                throw new BadRequestException(`Register end date cannot be in the past`)
            }
            if (new Date(tournamentDto.tournamentStartDate) < new Date()) {
                throw new BadRequestException(`Tournament start date cannot be in the past`)
            }
            if (new Date(tournamentDto.tournamentEndDate) < new Date()) {
                throw new BadRequestException(`Tournament end date cannot be in the past`)
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
