'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { fetchTour, updateTour } from '@/lib/api';
import { UpdatedTourFormData, updatedTourSchema } from '@/lib/schemas';
import { toast } from 'react-toastify';

const TourDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: tour, isLoading } = useQuery({
    queryKey: ['tour', id],
    queryFn: () => fetchTour(id),
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UpdatedTourFormData>({
    resolver: zodResolver(updatedTourSchema),
    values: tour,
  });

  const { mutate: updatedTourMutate, isPending } = useMutation({
    mutationFn: (data: FormData) => updateTour({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour', id] });
      toast.success('Tour updated successfully!');
      router.push(`/`);
    },
    onError: (error) => {
      console.log('error update tour', error);
      toast.error('Tour updated failed!');
    },
  });

  const onSubmit = async (data: UpdatedTourFormData) => {
    console.log('onSubmit data', data);
    try {
      const formData = new FormData();
      formData.append('tourId', id);
      formData.append('name', data.name);
      formData.append('location', data.location);
      formData.append('price', String(data.price));
      formData.append('duration', String(data.duration));
      formData.append('description', data.description);
      if (data.image && data.image.length > 0) {
        formData.append('image', data.image[0]); // FileList[0]
      }

      updatedTourMutate(formData);
    } catch (error) {
      console.log('error', error);
    }
  };

  if (isLoading || !tour) return <p>Loading tour...</p>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold">{tour.name}</h1>

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
          <label className="block mb-2 font-bold">Tour Image</label>

          {watch('image') && watch('image')[0] ? (
            <img
              src={URL.createObjectURL(watch('image')[0])}
              alt="Selected preview"
              className="w-full rounded mb-2 mt-1 max-h-60 object-cover"
            />
          ) : (
            tour.imageUrl && (
              <img
                src={tour.imageUrl}
                alt={tour.name}
                className="w-full rounded mb-2 max-h-60 object-cover"
              />
            )
          )}
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
          {errors.image?.message &&
            typeof errors.image?.message === 'string' && (
              <p className="text-red-500">{errors.image.message}</p>
            )}
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded cursor-pointer"
        >
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default TourDetailPage;
