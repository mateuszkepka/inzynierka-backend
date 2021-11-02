import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Group } from './group.entity';
import { Team } from './team.entity';

@Entity()
export class GroupStanding {
    @PrimaryGeneratedColumn()
    groupStandingId: number;

    @Column()
    place: number;

    @Column()
    points: number;

    @OneToMany(() => Group, (group) => group.groupStandings)
    @JoinColumn({ name: "groupId"})
    group: Group;

    @ManyToOne(() => Team)
    @JoinColumn({ name: "teamId"})
    team: Team;
}
