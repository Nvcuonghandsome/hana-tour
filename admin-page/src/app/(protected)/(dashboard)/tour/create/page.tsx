'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { createTour } from '@/lib/api';
import { CreateTourFormData, createTourSchema } from '@/lib/schemas';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

const CreateTour = () => {
  const router = useRouter();

  const queryClient = useQueryClient();
  const { mutate: createNewTour, isPending } = useMutation({
    mutationFn: (data: FormData) => createTour({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      toast.success('Tour created successfully!');
      router.push('/');
    },
    onError: (error) => {
      toast.error(
        `Failed to create tour: ${error?.message || 'Create tour error'}`,
      );
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateTourFormData>({
    resolver: zodResolver(createTourSchema),
  });

  const onSubmit = async (data: CreateTourFormData) => {
    // console.log('data', data);
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
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold">Create New Tour</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-bold">Name</label>
            <input
              {...register('name')}
              className="w-full p-2 border rounded-sm"
            />
            {errors.name && (
              <p className="text-red-500">{errors.name.message}</p>
            )}
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-bold">Price</label>
            <input
              type="number"
              step="0.01"
              min="0"
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
              min="0"
              {...register('duration', { valueAsNumber: true })}
              className="w-full p-2 border rounded-sm"
            />
            {errors.duration && (
              <p className="text-red-500">{errors.duration.message}</p>
            )}
          </div>
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
          {watch('image') && watch('image')[0] && (
            <img
              src={URL.createObjectURL(watch('image')[0])}
              alt="Selected preview"
              className="w-full rounded mb-2 mt-1 max-h-60 object-cover"
            />
          )}
          {errors.image?.message &&
            typeof errors.image?.message === 'string' && (
              <p className="text-red-500">{errors.image.message}</p>
            )}
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
