// import NextAuth from 'next-auth'  ← you can leave this commented or delete it

import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
export {}

  