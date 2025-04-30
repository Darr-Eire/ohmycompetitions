import NextAuth from 'next-auth'
import PiProvider from 'next-auth/providers/pi-network'  // or your actual Pi provider import

export default NextAuth({
  providers: [
    PiProvider({
      clientId:     process.env.PI_APP_ID,
      clientSecret: process.env.PI_APP_SECRET,
      authorization: {
        url:   process.env.PI_OAUTH_AUTHORIZE_URL,
        params: { scope: 'pi_user_info pi_transactions' }
      },
      token:    process.env.PI_OAUTH_TOKEN_URL,
      userinfo: process.env.PI_OAUTH_USERINFO_URL,
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) token.piAccessToken = account.access_token
      return token
    },
    async session({ session, token }) {
      session.piAccessToken = token.piAccessToken
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  // …any other NextAuth settings…
})
