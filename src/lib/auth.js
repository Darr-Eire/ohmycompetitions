import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Admin Login',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (
          credentials?.username === process.env.ADMIN_USERNAME &&
          credentials?.password === process.env.ADMIN_PASSWORD
        ) {
          return {
            id: 1,
            name: 'Admin',
            email: process.env.ADMIN_EMAIL,
            role: 'admin',
          };
        }
        return null;
      },
    }),
  ],

  session: { strategy: 'jwt' },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: '/admin/login',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.email = user.email;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.role = token.role;
      session.user.email = token.email;
      return session;
    },
  },
};
