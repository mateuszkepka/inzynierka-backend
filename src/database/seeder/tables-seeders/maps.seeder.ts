import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Map as MatchMap, Match, Performance, Player } from 'src/database/entities';
import { MatchesService } from 'src/modules/matches/matches.service';
import { Repository } from 'typeorm';

@Injectable()
export class MapSeeder {
    constructor(
        @InjectRepository(Performance) private readonly performancesRepository: Repository<Performance>,
        @InjectRepository(Player) private readonly playersRepository: Repository<Player>,
        @InjectRepository(Match) private readonly matchesRepository: Repository<Match>,
        @InjectRepository(Map) private readonly mapsRepository: Repository<MatchMap>,
        private readonly matchesService: MatchesService
    ) { }

    async seed() {
        const matches = await this.matchesRepository.find({
            relations: [`firstRoster`, `secondRoster`, `maps`]
        });
        for (const match of matches) {
            const mapPerformances: Map<MatchMap, Performance[]> = new Map<MatchMap, Performance[]>();
            for (let i = 0; i < match.numberOfMaps; i++) {
                const minutes = Math.floor(Math.random() * (40)) + 10;
                const seconds = Math.floor(Math.random() * (49)) + 10;
                const mapTime = `${minutes}:${seconds}`;
                const map = this.mapsRepository.create({
                    mapWinner: Math.floor(Math.random() * (2)) + 1,
                    time: mapTime,
                    match: match,
                    performances: []
                });
                const players = [];
                if (match.firstRoster != null) {
                    for (const roster of match.firstRoster.roster) {
                        players.push(roster.playerId);
                    }
                }
                if (match.secondRoster != null) {
                    for (const roster of match.secondRoster.roster) {
                        players.push(roster.playerId);
                    }
                }
                const performances = [];
                for (let i = 0; i < players.length; i++) {
                    const player = await this.playersRepository.findOne({ where: { playerId: players[i] } });
                    const performance = this.performancesRepository.create({
                        kills: Math.floor(Math.random() * (20)),
                        deaths: Math.floor(Math.random() * (15)),
                        assists: Math.floor(Math.random() * (20)),
                        gold: Math.floor(Math.random() * (20000)) + 3000,
                        creepScore: Math.floor(Math.random() * (300)) + 50,
                        player: player,
                        map: map
                    });
                    performances.push(performance);
                }
                mapPerformances.set(map, performances);
            }
            await this.matchesService.createMaps(match, mapPerformances);
        }
    }
}
