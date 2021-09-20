import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { GroupRule } from './group-rule.entity';

@Entity()
export class TiebrakerRule {
    @PrimaryGeneratedColumn()
    tiebrakerRuleId: number;

    @Column()
    rule: string;

    @OneToMany(() => GroupRule, (groupRule) => groupRule.tiebrakerRule)
    groupRules: GroupRule[];
}
