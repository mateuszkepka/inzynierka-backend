import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Player } from './player.entity';
import { Roster } from './roster.entity';

@Entity()
export class Team {
    @PrimaryGeneratedColumn()
    teamId: number;

    @Column()
    name: string;

    @Column()
    creationDate: Date;

    @OneToMany(() => Player, (player) => player.ownedTeams)
    captain: Player;

    @OneToMany(() => Roster, (roster) => roster.team)
    rosters: Roster[];
}
