import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        uid: { label: 'Pi UID', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials.uid) return null
        return { id: credentials.uid, uid: credentials.uid }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.uid = token.uid
      return session
    },
    async jwt({ token, user }) {
      if (user) token.uid = user.uid
      return token
    },
  },
  session: {
    strategy: 'jwt',
  },
}
