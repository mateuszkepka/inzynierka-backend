import { Entity, OneToMany } from "typeorm";

import { Game } from "./game.entity";
import { Group } from "./group.entity";
import { Ladder } from "./ladder-entity";
import { Match } from "./match.entity";

@Entity()
export class Tournament {
    @OneToMany(() => Game, (game) => game.tournament)
    games: Game[];

    @OneToMany(() => Group, (group) => group.tournament)
    groups: Group[];

    @OneToMany(() => Ladder, (ladder) => ladder.tournament)
    ladders: Ladder[];

    @OneToMany(() => Match, (match) => match.tournament)
    matches: Match[];
}