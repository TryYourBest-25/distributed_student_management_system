'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export default function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="text-gray-500">Loading...</div>;
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <p>
          Signed in as <span className="font-semibold">{session.user?.name ?? session.user?.email}</span>
        </p>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="px-4 py-2 font-semibold text-white bg-red-500 rounded hover:bg-red-600"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <p>Not signed in</p>
      <button
        onClick={() => signIn('keycloak')}
        className="px-4 py-2 font-semibold text-white bg-blue-500 rounded hover:bg-blue-600"
      >
        Sign in with Keycloak
      </button>
    </div>
  );
} 