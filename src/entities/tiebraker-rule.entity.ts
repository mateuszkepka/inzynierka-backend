import { Entity, OneToMany } from "typeorm";

import { GroupRule } from "./group-rule.entity";

@Entity()
export class TiebrakerRule {
    @OneToMany(() => GroupRule, (groupRule) => groupRule.tiebrakerRule)
    groupRules: GroupRule[]; 
}