import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Player } from './player.entity';
import { ParticipatingTeam } from './participating-team.entity';
import { PlayerTeam } from '.';

@Entity()
export class Team {
    @PrimaryGeneratedColumn()
    teamId: number;

    @Column()
    @Expose()
    name: string;

    @Column()
    @Expose()
    creationDate: Date;

    @OneToOne(() => Player, (player) => player.ownedTeams)
    @JoinColumn({ name: `captainId` })
    @Expose()
    captain: Player;

    @OneToMany(() => ParticipatingTeam, (roster) => roster.team)
    rosters: ParticipatingTeam[];

    @OneToMany(() => PlayerTeam, (playerTeam) => playerTeam.player)
    playerTeams: PlayerTeam[];
}
