import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { Game } from 'src/entities';
import JwtAuthGuard from '../auth/guards/jwt-auth.guard';
import { GamesService } from './games.service';

@Controller('games')
export class GamesController {
    constructor(private readonly gamesService: GamesService) { }
    
}
