import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import type { NextAuthConfig } from 'next-auth'

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/timeline') ||
        nextUrl.pathname.startsWith('/oshi') ||
        nextUrl.pathname.startsWith('/events') ||
        nextUrl.pathname.startsWith('/trip-plans') ||
        nextUrl.pathname.startsWith('/expenses') ||
        nextUrl.pathname.startsWith('/settings') ||
        nextUrl.pathname.startsWith('/setup')

      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/timeline', nextUrl))
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
