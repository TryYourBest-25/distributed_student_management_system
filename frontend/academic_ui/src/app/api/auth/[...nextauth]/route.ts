import NextAuth, { DefaultSession, NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import KeycloakProvider from 'next-auth/providers/keycloak';
import { jwtDecode } from 'jwt-decode';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      roles: string[];
      accessToken: string;
    } & DefaultSession['user'];
  }

  interface User {
    roles: string[];
    accessToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    roles: string[];
    accessToken: string;
  }
}

if (!process.env.KEYCLOAK_CLIENT_ID) {
  throw new Error('Missing KEYCLOAK_CLIENT_ID in .env.dev');
}
if (!process.env.KEYCLOAK_CLIENT_SECRET) {
  throw new Error('Missing KEYCLOAK_CLIENT_SECRET in .env.dev');
}
if (!process.env.KEYCLOAK_URL) {
  throw new Error('Missing KEYCLOAK_URL in .env.dev');
}
if (!process.env.KEYCLOAK_REALM) {
  throw new Error('Missing KEYCLOAK_REALM in .env.dev');
}
if (!process.env.NEXTAUTH_URL) {
    throw new Error('Missing NEXTAUTH_URL in .env.dev');
}
if (!process.env.NEXTAUTH_SECRET) {
    throw new Error('Missing NEXTAUTH_SECRET in .env.dev');
}


const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
      issuer: `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}`,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ account }) {
      if (!account?.access_token) {
        return '/error?error=AccessDenied';
      }
      
      try {
        const decodedToken: { realm_access?: { roles: string[] } } = jwtDecode(account.access_token);
        const roles = decodedToken?.realm_access?.roles ?? [];

        // TODO: Tạm thời bỏ kiểm tra roles để test
        // if (roles.includes('PGV') || roles.includes('KHOA')) {
        //   return true;
        // } else {
        //   return '/unauthorized';
        // }
        
        console.log('User roles:', roles);
        return true; // Cho phép tất cả users đăng nhập tạm thời
      } catch (error) {
        console.error("Error decoding token:", error);
        return '/error?error=InvalidToken';
      }
    },
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
        const decodedToken: { realm_access: { roles: string[] } } = jwtDecode(
          account.access_token,
        );
        token.roles = decodedToken.realm_access?.roles || [];
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.roles = token.roles;
        session.user.accessToken = token.accessToken;
        if (token.sub) {
          session.user.id = token.sub;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/error',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, authOptions }; 