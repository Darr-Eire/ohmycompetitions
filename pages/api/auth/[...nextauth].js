// pages/api/auth/[...nextauth].js
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // TODO: Replace with real lookup (e.g. DB query)
        if (credentials.username === 'admin' && credentials.password === 'supersecret') {
          return { id: 1, name: 'Admin User', isAdmin: true }
        }
        if (credentials.username === 'user' && credentials.password === 'password') {
          return { id: 2, name: 'Regular User', isAdmin: false }
        }
        // Invalid credentials
        return null
      }
    })
  ],

  // Use JWT-based sessions:
  session: { strategy: 'jwt' },

  callbacks: {
    // Attach isAdmin to the JWT on initial sign-in:
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = user.isAdmin
      }
      return token
    },
    // Expose isAdmin on the client-side session object:
    async session({ session, token }) {
      session.user.isAdmin = token.isAdmin
      return session
    }
  },

  // Secret for signing tokens & cookies
  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: '/auth/signin',  // optional custom sign-in page
  }
}

export default NextAuth(authOptions)
