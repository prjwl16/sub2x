import { NextAuthOptions } from "next-auth"
import TwitterProvider from "next-auth/providers/twitter"

export const authOptions: NextAuthOptions = {
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id
      }
      if (account && profile) {
        // Extract Twitter handle from profile
        if (profile && typeof profile === 'object' && 'username' in profile) {
          token.handle = profile.username as string
        }
      }
      return token
    },
    async session({ session, token }) {
      console.log(session, token);
      if (token) {
        session.user.id = token.id as string
        session.user.handle = token.handle as string
      }
      return session
    },
  },
  pages: {
    signIn: "/api/auth/signin",
  },
}
