// lib/auth.js
import GitHubProvider from 'next-auth/providers/github'; // or your real provider

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET, // ✅ THIS MUST BE HERE
};
