import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Expose } from 'class-transformer';
import { ParticipatingTeam } from './participating-team.entity';
import { Player } from './player.entity';
import { PlayerTeam } from '.';

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

    @ManyToOne(() => Player, (player) => player.ownedTeams, {
        eager: true,
    })
    @JoinColumn({ name: `captainId` })
    @Expose()
    captain: Player;

    @OneToMany(() => ParticipatingTeam, (roster) => roster.team)
    rosters: ParticipatingTeam[];

    @OneToMany(() => PlayerTeam, (playerTeam) => playerTeam.player)
    playerTeams: PlayerTeam[];
}
