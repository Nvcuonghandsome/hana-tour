'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { fetchTours } from '@/lib/api';

const DashboardPage = () => {
  const { data: session } = useSession();
  // console.log('session', session);
  const router = useRouter();

  const {
    data: tours,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['tours'],
    queryFn: () => fetchTours(session?.accessToken || ''),
    enabled: !!session?.accessToken, // wait until token exists
  });

  const goToTourDetail = (tourId: string) => {
    router.push(`/tour/${tourId}`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">All Tours</h2>
        <Link
          href="/tour/create"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          + Create Tour
        </Link>
      </div>

      {isLoading && <p>Loading tours...</p>}
      {isError && <p className="text-red-500">Failed to load tours.</p>}

      <div className="space-y-4">
        {tours?.map((tour) => (
          <div
            onClick={() => goToTourDetail(tour.id)}
            key={tour.id}
            className="border p-4 rounded shadow-sm cursor-pointer"
          >
            <h3 className="text-lg font-bold">{tour.name}</h3>
            <p className="text-sm text-gray-600">{tour.location}</p>
            <p className="text-sm text-gray-700">
              Price: ${tour.price.toFixed(2)} | Duration: {tour.duration} day
              {tour.duration > 1 ? 's' : ''}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
