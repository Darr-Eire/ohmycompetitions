import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
// or import your providers (Google, GitHub, etc)

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      authorize(credentials) {
        // ✅ Add your own logic here
        return { id: 1, name: 'Admin' };
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
