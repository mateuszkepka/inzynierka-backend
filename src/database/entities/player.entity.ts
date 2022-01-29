import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Game, Invitation, Performance } from '.';
import { Expose, Transform } from 'class-transformer';
import { Team } from './team.entity';
import { User } from './user.entity';
import { RegionsLoL } from 'src/modules/games/interfaces/regions';

@Entity()
export class Player {
    @Expose()
    @PrimaryGeneratedColumn()
    playerId: number;

    @Expose()
    @Column({ nullable: true, unique: true })
    summonerName: string;

    @Column({ nullable: true })
    PUUID: string;

    @Column({ nullable: true })
    accountId: string;

    @Column({ nullable: true })
    summonerId: string;

    @Expose()
    @Column({
        type: `enum`,
        enum: RegionsLoL,
    })
    region: RegionsLoL;

    @Expose()
    @ManyToOne(() => User, (user) => user.accounts, { onDelete: `NO ACTION` })
    @JoinColumn({ name: `userId` })
    user: User;

    @Expose()
    @OneToMany(() => Performance, (performance) => performance.player)
    performances: Performance[];

    @Expose()
    @OneToMany(() => Team, (team) => team.captain)
    ownedTeams: Team[];

    @Expose({ name: `gameId` })
    @Transform(({ value }) => {
        if (value !== undefined) {
            return value.gameId;
        } else {
            return;
        }
    }, { toPlainOnly: true })
    @ManyToOne(() => Game)
    @JoinColumn({ name: `gameId` })
    game: Game;

    @Expose({ name: `invitationId` })
    @Transform(({ value }) => {
        if (value !== undefined) {
            return value[0].invitationId;
        } else {
            return;
        }
    }, { toPlainOnly: true })
    @OneToMany(() => Invitation, (invitation) => invitation.player)
    teams: Invitation[];
}
