'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { logout } from '@/lib/api';
import { useSearchStore } from '@/lib/store/useSearchStore';
import { useEffect } from 'react';

const Header = () => {
  const { data: session } = useSession();
  const { search, setSearch, setDebouncedSearch } = useSearchStore();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, setDebouncedSearch]);

  const handleLogout = async () => {
    try {
      // Logout from the API
      await logout();

      // Sign out from NextAuth
      await signOut({ callbackUrl: '/login' }); // Optional: redirect after logout
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-md">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-xl font-bold text-blue-600">
          Hana Tours
        </Link>
        {session?.user && (
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tours..."
            className="px-3 py-1 border rounded-md text-sm sm:w-60 w-[50%]"
          />
        )}
      </div>

      <div className="flex items-center gap-4">
        {session?.user ? (
          <>
            <span className="text-sm text-gray-600 hidden sm:inline">
              Hi, {session.user.firstName} {session.user.lastName}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600 cursor-pointer"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="px-4 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
