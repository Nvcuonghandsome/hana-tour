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
        expiresInFormat: res.data.expiresInFormat,
      },
    };
    console.log('refreshTokens new token', result);

    return result;
  } catch (error) {
    console.error('refreshTokens error', error);
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

          const {
            user,
            accessToken,
            refreshToken,
            expiresIn,
            expiresInFormat,
          } = res.data;
          if (user && accessToken && refreshToken && expiresIn) {
            return {
              ...user,
              accessToken,
              refreshToken,
              expiresIn,
              expiresInFormat,
            };
          }
          return null;
        } catch (error) {
          console.log('error', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log('callbacks jwt token on', new Date(), 'token', token);
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
          error: 'RefreshTokenError catch',
          errorObj: error,
        };
      }
    },
    async session({ session, token }) {
      session.user = token.user;
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};
