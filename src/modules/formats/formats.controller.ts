import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/modules/auth/dto/roles.enum';
import { FormatsService } from './formats.service';

@Controller(`formats`)
@Roles(Role.Organizer)
export class FormatsController {
    constructor(private readonly formatsService: FormatsService) { }

    @Get(`:id`)
    async getById(@Param(`id`, ParseIntPipe) id: number) {
        return this.formatsService.getById(id);
    }

    @Get()
    async getAll() {
        return this.formatsService.getAll();
    }
}
