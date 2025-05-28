import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { createTourDto, updateTourDto } from './dto/tour.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class TourService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  // create new tour by login user
  async createTour(
    userId: string,
    body: createTourDto,
    file: Express.Multer.File,
  ) {
    // upload image to cloudinary
    if (!file) throw new BadRequestException('No file uploaded');
    const result: any = await this.cloudinary.uploadImage(file);
    if (!result) throw new BadRequestException('Upload image failed');

    // create new tour
    const { secure_url, public_id } = result;
    const { name, description, location, price, duration } = body;
    const parseDuration = parseFloat(duration);
    const newTour = await this.prisma.tour.create({
      data: {
        name,
        description,
        location,
        price: parseFloat(price),
        duration: parseFloat(duration),
        userId,
        imageUrl: secure_url,
        imagePublicId: public_id,
      },
    });
    if (!newTour) throw new NotFoundException('Create tour failed');

    return {
      data: newTour,
      message: 'Create new tour successfully!',
    };
  }

  async updateTour(body: updateTourDto) {
    // add image upload later
    const { tourId, name, description, location, price, duration } = body;
    const updatedTour = await this.prisma.tour.update({
      where: { id: tourId },
      data: {
        name,
        description,
        location,
        price: parseFloat(price),
        duration: parseFloat(duration),
      },
    });

    return {
      data: updatedTour,
      message: 'Updated tour successfully!',
    };
  }

  async getTour(tourId: string) {
    const tour = await this.prisma.tour.findUnique({ where: { id: tourId } });

    return {
      data: tour,
      message: 'Get tour successfully!',
    };
  }

  async uploadTourImage(tourId: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');

    const tour = await this.prisma.tour.findUnique({ where: { id: tourId } });
    if (!tour) throw new BadRequestException('Tour not found');

    // Delete old image
    if (tour.imagePublicId) {
      await this.cloudinary.deleteImage(tour.imagePublicId);
    }

    // Upload new image
    const result: any = await this.cloudinary.uploadImage(file);
    await this.prisma.tour.update({
      where: { id: tourId },
      data: {
        imageUrl: result['secure_url'],
        imagePublicId: result['public_id'],
      },
    });

    return {
      data: {
        imageUrl: result['secure_url'],
        imagePublicId: result['public_id'],
      },
      message: 'Upload image successfully!',
    };
  }

  // get all tour belong to login user
  async getTourList(userId: string) {
    const tours = await this.prisma.tour.findMany({
      where: {
        userId,
      },
    });

    return {
      data: tours,
      message: 'Get tour list successfully!',
    };
  }
}
