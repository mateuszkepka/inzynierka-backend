import { IsNumber, isNumber, IsString } from "class-validator";

export class TeamMembers {
    @IsNumber()
    teamId: number;

    @IsString()
    teamName: string;
}