import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';
import axios from 'axios';
import { JWT } from 'next-auth/jwt';

const refreshTokens = async (token: JWT): Promise<JWT> => {
  try {
    if (!token.user.refreshToken) {
      throw new Error('No refresh token found');
    }

    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token.user.refreshToken}`,
        },
      },
    );

    const result = {
      ...token,
      accessToken: res.data.accessToken,
      user: {
        ...res.data.user,
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
        expiresIn: res.data.expiresIn,
      },
    };
    console.log('refreshTokens new token', result);

    return result;
  } catch (error) {
    // console.error('Error in refreshTokens:', error);
    // throw new Error('RefreshTokenError');
    return {
      ...token,
      error: 'RefreshTokenError',
    };
  }
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
            {
              email: credentials?.email,
              password: credentials?.password,
            },
          );

          const { user, accessToken, refreshToken, expiresIn } = res.data;
          if (user && accessToken && refreshToken && expiresIn) {
            return {
              ...user,
              accessToken,
              refreshToken,
              expiresIn,
            };
          }
          return null;
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log('callbacks jwt token', token);
      console.log('callbacks jwt user', user);
      if (user) {
        token.user = user;
        token.accessToken = user.accessToken;
      }

      if (new Date().getTime() < token.user.expiresIn) {
        return token;
      }

      try {
        return await refreshTokens(token);
      } catch (error) {
        return {
          ...token,
          error: 'RefreshTokenError',
        };
      }
    },
    async session({ session, token }) {
      session.user = token.user;
      session.accessToken = token.accessToken;
      session.error = token.error;
      console.log('session', session);
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};
