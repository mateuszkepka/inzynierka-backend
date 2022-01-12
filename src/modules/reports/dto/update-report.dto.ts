import { IsEnum, IsNotEmpty } from 'class-validator';
import { ReportStatus } from '../report-status.enum';

export class UpdateReportDto {
    @IsNotEmpty()
    @IsEnum(ReportStatus)
    status: ReportStatus;
}
