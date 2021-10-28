import { Expose } from 'class-transformer';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Player } from './player.entity';
import { Roster } from './roster.entity';

@Entity()
export class Team {
    @PrimaryGeneratedColumn()
    @Expose()
    teamId: number;

    @Column()
    @Expose()
    name: string;

    @Column()
    @Expose()
    creationDate: Date;

    @OneToMany(() => Player, (player) => player.ownedTeams)
    captain: Player;

    @OneToMany(() => Roster, (roster) => roster.team)
    rosters: Roster[];
}
