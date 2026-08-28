import { Controller, Get, Query } from '@nestjs/common';
import { ReportQueryDto } from './dto/report-query.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('users/summary')
  summary() {
    return this.reportsService.summary();
  }

  @Get('users')
  list(@Query() query: ReportQueryDto) {
    return this.reportsService.list(query);
  }
}
