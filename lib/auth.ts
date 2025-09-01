// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
import { prisma } from "./db";
import { processUserFirstLogin } from "./onboarding";

export const authOptions: NextAuthOptions = {
  providers: [
    TwitterProvider({ 
      version: "2.0",
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      // v2 scopes: need users.read to get username; tweet.write if you'll post later
      authorization: {
        params: {
          scope: "users.read tweet.read tweet.write offline.access",
        },
      },
      // Map raw v2 profile -> NextAuth user
      profile(raw) {
        // raw is typically: { data: { id, name, username, ... } }
        const p = raw as any;
        return {
          id: p?.data?.id,
          name: p?.data?.name ?? null,
          image: p?.data?.profile_image_url ?? null, // may require user.fields in your X app config
          // custom fields allowed here:
          username: p?.data?.username ?? null,
          // Don't fake email; OAuth2 doesn't provide it.
          email: null,
        } as any;
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "twitter" && account?.access_token) {
        try {
          // Check if user already exists in our database
          const existingUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
              accounts: {
                where: { provider: "X" },
              },
            },
          });

          if (!existingUser) {
            // Create new user in our database
            await prisma.user.create({
              data: {
                id: user.id,
                name: user.name,
                image: user.image,
                handle: (user as any).username,
              },
            });
          }

          // Upsert the social account with the access token
          await prisma.socialAccount.upsert({
            where: {
              provider_providerAccountId: {
                provider: "X",
                providerAccountId: account.providerAccountId,
              },
            },
            update: {
              accessToken: account.access_token,
              refreshToken: account.refresh_token,
              scope: account.scope,
              tokenType: account.token_type,
              expiresAt: account.expires_at ? new Date(account.expires_at * 1000) : null,
              username: (user as any).username,
              displayName: user.name,
            },
            create: {
              userId: user.id,
              provider: "X",
              providerAccountId: account.providerAccountId,
              accessToken: account.access_token,
              refreshToken: account.refresh_token,
              scope: account.scope,
              tokenType: account.token_type,
              expiresAt: account.expires_at ? new Date(account.expires_at * 1000) : null,
              username: (user as any).username,
              displayName: user.name,
            },
          });

          // Fire-and-forget onboarding (do not block sign-in)
          if (user?.id) {
            console.log('[auth] onboarding', (user as any).id)
            // Run in next tick to avoid blocking sign-in
            Promise.resolve().then(() => {
              processUserFirstLogin((user as any).id as string).catch((err) => console.error('[auth] onboarding error', err))
            })
          }
          return true;
        } catch (error) {
          console.error("Error during sign in:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account, profile }) {
      // On first sign-in, `user` is present (your mapped object).
      if (user) {
        token.id = (user as any).id;
        if ((user as any).username) {
          token.handle = (user as any).username;   // persist handle
        }
      }

      // Also handle the very first OAuth response (when `profile` is present)
      if (account && profile) {
        const p = profile as any;
        if (p?.data?.username) token.handle = p.data.username;
        if (p?.data?.id) token.xUserId = p.data.id; // handy for posting later
      }

      return token;
    },

    async session({ session, token }) {
      if (token?.id) (session.user as any).id = token.id as string;
      if (token?.handle) (session.user as any).handle = token.handle as string;
      if (token?.xUserId) (session.user as any).xUserId = token.xUserId as string;
      return session;
    },
  },

  pages: {
    signIn: "/api/auth/signin",
  },
};
