'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { createTour } from '@/lib/api';
import { CreateTourFormData, createTourSchema } from '@/lib/schemas';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const CreateTour = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const queryClient = useQueryClient();
  const { mutate: createNewTour, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      createTour({ data, token: session?.accessToken || '' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      alert('Tour created!');
      router.push('/');
    },
    onError: () => {
      alert('Failed to create tour');
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTourFormData>({
    resolver: zodResolver(createTourSchema),
  });

  const onSubmit = async (data: CreateTourFormData) => {
    console.log('data', data);
    const formData = new FormData();

    formData.append('name', data.name);
    formData.append('location', data.location);
    formData.append('price', String(data.price));
    formData.append('duration', String(data.duration));
    formData.append('description', data.description);
    formData.append('image', data.image[0]); // FileList[0]

    try {
      createNewTour(formData);
    } catch (error) {
      console.log('error', error);
      alert('Failed to create tour');
    } finally {
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Create New Tour</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="font-bold">Name</label>
          <input
            {...register('name')}
            className="w-full p-2 border rounded-sm"
          />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <label className="font-bold">Location</label>
          <input
            {...register('location')}
            className="w-full p-2 border rounded-sm"
          />
          {errors.location && (
            <p className="text-red-500">{errors.location.message}</p>
          )}
        </div>

        <div>
          <label className="font-bold">Price</label>
          <input
            type="number"
            step="0.01"
            {...register('price', { valueAsNumber: true })}
            className="w-full p-2 border rounded-sm"
          />
          {errors.price && (
            <p className="text-red-500">{errors.price.message}</p>
          )}
        </div>

        <div>
          <label className="font-bold">Duration (days)</label>
          <input
            type="number"
            {...register('duration', { valueAsNumber: true })}
            className="w-full p-2 border rounded-sm"
          />
          {errors.duration && (
            <p className="text-red-500">{errors.duration.message}</p>
          )}
        </div>

        <div>
          <label className="font-bold">Description</label>
          <textarea
            {...register('description')}
            className="w-full p-2 border rounded-sm"
            rows={4}
          />
          {errors.description && (
            <p className="text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="font-bold">Image</label>
          <input
            type="file"
            accept="image/*"
            {...register('image')}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          {typeof errors?.image?.message === 'string'
            ? errors.image.message
            : 'Invalid file'}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-green-600 text-white rounded cursor-pointer disabled:opacity-50"
        >
          {isPending ? 'Creating...' : 'Create Tour'}
        </button>
      </form>
    </div>
  );
};

export default CreateTour;
