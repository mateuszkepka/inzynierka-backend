import { IsEnum, IsNumber, IsNumberString, IsOptional } from "class-validator";
import { ReportStatus } from "../report-status.enum";

export class ReportStatusQuery {
    @IsOptional()
    @IsNumberString()
    reportedId: number

    @IsOptional()
    @IsNumberString()
    reportingId: number

    @IsOptional()
    @IsEnum(ReportStatus)
    status: ReportStatus
}