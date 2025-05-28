import * as z from 'zod';

export const tourSchema = z.object({
  name: z.string().min(2),
  location: z.string().min(2),
  price: z.number().positive(),
  duration: z.number().positive(),
  description: z.string().min(5),
});
export type TourFormData = z.infer<typeof tourSchema>;

export const createTourSchema = tourSchema.extend({
  image: z
    .any()
    .refine((files) => files?.length === 1, 'Image is required')
    .refine(
      (files) => files?.[0]?.type?.startsWith('image/'),
      'Only image files are allowed',
    ),
});
export type CreateTourFormData = z.infer<typeof createTourSchema>;
