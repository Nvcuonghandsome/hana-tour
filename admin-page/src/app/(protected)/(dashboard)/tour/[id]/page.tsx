'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { fetchTour, updateTour, uploadTourImage } from '@/lib/api';
import { TourFormData, tourSchema } from '@/lib/schemas';
import { toast } from 'react-toastify';

const TourDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: tour, isLoading } = useQuery({
    queryKey: ['tour', id],
    queryFn: () => fetchTour(id),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TourFormData>({
    resolver: zodResolver(tourSchema),
    values: tour,
  });

  const { mutate: saveChanges } = useMutation({
    mutationFn: (data: TourFormData) => updateTour({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour', id] });
      toast.success('Tour updated successfully!');
    },
    onError: (error) => {
      console.log('error update tour', error);
      toast.error('Tour updated failed!');
    },
  });

  const onSubmit = async (data: TourFormData) => {
    setUploading(true);

    try {
      // 1. Update tour data
      saveChanges(data);

      // 2. Upload image if there's a new one
      if (selectedFile) {
        await uploadTourImage({
          id,
          file: selectedFile,
        });
      }
      router.push(`/`);
    } catch (error) {
      console.log('error', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    setSelectedFile(file);
  };

  if (isLoading || !tour) return <p>Loading tour...</p>;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{tour.name}</h1>

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
          <label className="block mb-2 font-bold">Tour Image</label>

          {tour.imageUrl && (
            <img
              src={tour.imageUrl}
              alt="Current Tour"
              className="w-full rounded mb-2 max-h-60 object-cover"
            />
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />

          {selectedFile && (
            <p className="text-green-600 text-sm mt-1">
              Selected file: <strong>{selectedFile.name}</strong>
            </p>
          )}
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded cursor-pointer"
        >
          {uploading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default TourDetailPage;
