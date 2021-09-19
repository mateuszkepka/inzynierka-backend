import { Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

import { Group } from "./group.entity";
import { TiebrakerRule } from "./tiebraker-rule.entity";

@Entity()
export class GroupRule {
    @ManyToOne(() => Group, (group) => group.groupRules, { primary: true })
    group: Group;

    @ManyToOne(() => TiebrakerRule, (tiebrakerRule) => tiebrakerRule.groupRules, { primary: true })
    tiebrakerRule: TiebrakerRule;

    @Column()
    rulePriority: number;
}