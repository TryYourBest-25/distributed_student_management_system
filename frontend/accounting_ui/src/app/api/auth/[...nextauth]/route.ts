import NextAuth, { type DefaultSession } from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';
import { jwtDecode } from 'jwt-decode';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    roles?: string[];
    user: DefaultSession['user'] & {
      roles?: string[];
    };
  }
  interface JWT {
    roles?: string[];
    accessToken?: string;
  }
}

if (!process.env.KEYCLOAK_CLIENT_ID) {
  throw new Error('Missing KEYCLOAK_CLIENT_ID in .env.local');
}
if (!process.env.KEYCLOAK_CLIENT_SECRET) {
  throw new Error('Missing KEYCLOAK_CLIENT_SECRET in .env.local');
}
if (!process.env.KEYCLOAK_URL) {
  throw new Error('Missing KEYCLOAK_URL in .env.local');
}
if (!process.env.KEYCLOAK_REALM) {
  throw new Error('Missing KEYCLOAK_REALM in .env.local');
}

const handler = NextAuth({
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
      issuer: `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}`,
    }),
  ],
  callbacks: {
    async signIn({ account }) {
      if (!account?.access_token) return '/auth/error?error=AccessDenied';
      
      try {
        const decodedToken: { realm_access?: { roles: string[] } } = jwtDecode(account.access_token);
        const roles = decodedToken?.realm_access?.roles ?? [];

        if (roles.includes('PKT')) {
          return true; // Access granted
        } else {
          return '/unauthorized'; // Redirect to custom unauthorized page
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        return '/auth/error?error=InvalidToken';
      }
    },
    async jwt({ token, account }) {
      // Persist the OAuth access_token and roles to the token right after signin
      if (account?.access_token) {
        token.accessToken = account.access_token;
        const decodedToken: { realm_access?: { roles: string[] } } = jwtDecode(account.access_token);
        token.roles = decodedToken?.realm_access?.roles ?? [];
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token and roles from a provider.
      session.accessToken = token.accessToken as string | undefined;
      session.roles = token.roles as string[] | undefined;
      if (session.user) {
        session.user.roles = token.roles as string[] | undefined;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST }; 