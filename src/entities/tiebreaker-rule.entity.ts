import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { GroupRule } from './group-rule.entity';

@Entity()
export class TiebreakerRule {
    @PrimaryGeneratedColumn()
    tiebreakerRuleId: number;

    @Column()
    rule: string;

    @OneToMany(() => GroupRule, (groupRule) => groupRule.tiebreakerRule)
    groupRules: GroupRule[];
}
