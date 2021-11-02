import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { Group } from './group.entity';
import { TiebreakerRule } from './tiebreaker-rule.entity';

@Entity()
export class GroupRule {
    @ManyToOne(() => Group, (group) => group.groupRules, { primary: true })
    @JoinColumn({name : "groupId"})
    group: Group;

    @ManyToOne(() => TiebreakerRule, (tiebreakerRule) => tiebreakerRule.groupRules, { primary: true })
    @JoinColumn({name : "ruleId"})
    tiebreakerRule: TiebreakerRule;

    @Column()
    rulePriority: number;
}
