import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      role: 'Admin' | 'User';
      firstName: string;
      lastName: string;
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
    accessToken: string;
    error?: string;
  }

  interface User {
    id: string;
    email: string;
    role: 'Admin' | 'User';
    firstName: string;
    lastName: string;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    user: {
      id: string;
      email: string;
      role: 'Admin' | 'User';
      firstName: string;
      lastName: string;
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
    accessToken: string;
    error?: string;
  }
}
