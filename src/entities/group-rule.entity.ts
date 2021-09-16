import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";

import { Group } from "./group.entity";
import { TiebrakerRule } from "./tiebraker-rule.entity";

@Entity()
export class GroupRule {
    @PrimaryColumn()
    @ManyToOne(() => Group, (group) => group.groupRules)
    group: Group;

    @PrimaryColumn()
    @ManyToOne(() => TiebrakerRule, (tiebrakerRule) => tiebrakerRule.groupRules)
    tiebrakerRule: TiebrakerRule;

    @Column()
    rulePriority: number;
}