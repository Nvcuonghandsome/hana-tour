import * as z from 'zod';

export const updatedTourSchema = z.object({
  name: z.string().min(2, 'Name must contain at least 2 characters'),
  location: z.string().min(2, 'Location must contain at least 2 characters'),
  price: z.number({
    required_error: 'Price is required',
    invalid_type_error: 'Price must be a number',
  }),
  duration: z.number({
    required_error: 'Duration is required',
    invalid_type_error: 'Duration must be a number',
  }),
  description: z
    .string()
    .min(5, 'Description must contain at least 5 characters'),
  image: z
    .any()
    .optional()
    .refine((files) => !files || files.length === 1, 'Image is required')
    .refine(
      (files) => !files || files?.[0]?.type?.startsWith('image/'),
      'Only image files are allowed',
    ),
});
export type UpdatedTourFormData = z.infer<typeof updatedTourSchema>;

export const createTourSchema = updatedTourSchema.extend({
  image: z
    .any()
    .refine((files) => files?.length === 1, 'Image is required')
    .refine(
      (files) => files?.[0]?.type?.startsWith('image/'),
      'Only image files are allowed',
    ),
});
export type CreateTourFormData = z.infer<typeof createTourSchema>;
