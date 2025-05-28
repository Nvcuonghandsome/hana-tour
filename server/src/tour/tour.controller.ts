import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TourService } from './tour.service';
import { GetUser } from 'src/auth/decorator';
import { createTourDto, updateTourDto } from './dto/tour.dto';
import { JwtGuard, RolesGuard } from 'src/auth/guard';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtGuard)
@Controller('tour')
export class TourController {
  constructor(private tourService: TourService) {}

  @UseGuards(RolesGuard)
  @Post('create')
  @UseInterceptors(FileInterceptor('image'))
  createTour(
    @GetUser('id') userId: string,
    @Body() body: createTourDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('create tour body', { ...body, file: file });
    return this.tourService.createTour(userId, body, file);
  }

  @UseGuards(RolesGuard)
  @Put('update')
  updateTour(@Body() body: updateTourDto) {
    return this.tourService.updateTour(body);
  }

  @Get('detail/:tourId')
  getTour(@Param('tourId') tourId: string) {
    return this.tourService.getTour(tourId);
  }

  @UseGuards(RolesGuard)
  @Post('upload-image/:tourId')
  @UseInterceptors(FileInterceptor('image'))
  async uploadTourImage(
    @Param('tourId') tourId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.tourService.uploadTourImage(tourId, file);
  }

  @Get('list')
  getTourList(@GetUser('id') userId: string) {
    return this.tourService.getTourList(userId);
  }
}
