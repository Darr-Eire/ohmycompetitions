import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Pi',
      credentials: {
        uid: {},
        username: {},
        accessToken: {},
        wallet: {},
      },
      async authorize(credentials) {
        if (!credentials.uid || !credentials.username || !credentials.accessToken) return null
        return {
          id: credentials.uid,
          uid: credentials.uid,
          username: credentials.username,
          wallet: credentials.wallet,
          accessToken: credentials.accessToken,
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.uid
        token.username = user.username
        token.wallet = user.wallet
        token.piAccessToken = user.accessToken
      }
      return token
    },
    async session({ session, token }) {
      session.user.uid = token.uid
      session.user.username = token.username
      session.user.wallet = token.wallet
      session.piAccessToken = token.piAccessToken
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
})
