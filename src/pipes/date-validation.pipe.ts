import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';

@Injectable()
export class DateValidationPipe implements PipeTransform {
    async transform(value: any, { metatype }: ArgumentMetadata) {
        const suspensionDto = plainToClass(metatype, value);
        console.log(suspensionDto.endDate)
        if (new Date(suspensionDto.endDate) < new Date()) {
            throw new BadRequestException(`The end date cannot be in the past`)
        }
        return value;
    }
}