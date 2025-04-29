// pages/api/auth/[...nextauth].js
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Replace this with your real user lookup logic!
        if (credentials.username === 'admin' && credentials.password === 'supersecret') {
          return { id: 1, name: 'Admin User', isAdmin: true }
        }
        // Or for normal users:
        // return { id: 2, name: 'Regular', isAdmin: false }
        return null
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      // Forward the isAdmin flag from token to session
      session.user.isAdmin = token.isAdmin
      return session
    },
    async jwt({ token, user }) {
      // After initial sign in, attach isAdmin from user object to token
      if (user) {
        token.isAdmin = user.isAdmin
      }
      return token
    }
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)
