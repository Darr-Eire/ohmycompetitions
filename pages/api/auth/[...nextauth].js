import NextAuth from 'next-auth'
import { JWT } from 'next-auth/jwt'

// Custom Pi OAuth provider
function PiProvider(options) {
  return {
    id: 'pi',
    name: 'Pi Network',
    type: 'oauth',
    version: '2.0',
    authorization: {
      url: process.env.PI_OAUTH_AUTHORIZE_URL,
      params: { scope: 'pi_user_info pi_transactions' },
    },
    token: process.env.PI_OAUTH_TOKEN_URL,
    userinfo: process.env.PI_OAUTH_USERINFO_URL,
    clientId: process.env.PI_APP_ID,
    clientSecret: process.env.PI_APP_SECRET,
    checks: ['state'],
    profile(profile) {
      return {
        id: profile.id,
        name: profile.name || null,
        email: profile.email || null,
        image: profile.picture || null,
      }
    },
    options,
  }
}

export default NextAuth({
  providers: [
    PiProvider({})
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.piAccessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      session.piAccessToken = token.piAccessToken
      return session
    },
  },
})
