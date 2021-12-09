import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Game, Invitation } from '.';
import { Expose, Transform, Type } from 'class-transformer';
import { Performance } from './performance.entity';
import { Team } from './team.entity';
import { User } from './user.entity';

@Entity()
export class Player {
    @Expose()
    @PrimaryGeneratedColumn()
    playerId: number;

    @Expose()
    @Column()
    summonerName: string;

    @Column({ nullable: true })
    PUUID: string;

    @Column({ nullable: true })
    accountId: string;

    @Column({ nullable: true })
    summonerId: string;

    @Expose()
    @Column()
    region: string;

    @ManyToOne(() => User, (user) => user.accounts)
    @JoinColumn({ name: `userId` })
    @Expose()
    user: User;

    @OneToMany(() => Performance, (performance) => performance.player)
    performances: Performance[];

    @Expose()
    @OneToMany(() => Team, (team) => team.captain)
    ownedTeams: Team[];

    @Expose({ name: `gameId` })
    @ManyToOne(() => Game)
    @JoinColumn({ name: `gameId` })
    game: Game;

    @Expose()
    @OneToMany(() => Invitation, (invitation) => invitation.player)
    teams: Invitation[];
}
