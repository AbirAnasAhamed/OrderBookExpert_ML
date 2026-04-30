/**
 * @file lib/auth.ts
 * @description NextAuth configuration with Credentials provider.
 * The `authorize` function currently uses a hardcoded mock user.
 * In production (Phase 2), replace with a real API call to the FastAPI backend.
 *
 * Mock credentials:  email: admin@obe.io  |  password: Admin@123
 */
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

// NOTE: A stable secret is required for JWT signing.
// In production, override this via NEXTAUTH_SECRET environment variable.
const NEXTAUTH_SECRET =
  process.env.NEXTAUTH_SECRET ||
  "obe-v1-jwt-secret-32-chars-minimum-do-not-use-in-production"

export const authOptions: NextAuthOptions = {
  secret: NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // ─── REAL API AUTH (FastAPI Backend) ───────────────────────────
        // Calls POST /api/v1/auth/login and returns the user object
        // with the JWT access token attached for session storage.
        // ──────────────────────────────────────────────────────────────
        try {
          // In Docker, 'localhost' points to the frontend container itself.
          // For server-side NextAuth calls, we use INTERNAL_API_URL (http://backend:8000)
          const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
          const res = await fetch(`${apiUrl}/api/v1/auth/login`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({
              email:    credentials?.email,
              password: credentials?.password,
            }),
          })

          if (!res.ok) return null

          const data: {
            access_token:  string
            refresh_token: string
            token_type:    string
          } = await res.json()

          // Fetch user profile using the access token
          const meRes = await fetch(`${apiUrl}/api/v1/auth/me`, {
            headers: { Authorization: `Bearer ${data.access_token}` },
          })

          if (!meRes.ok) return null

          const me: {
            id:    number
            name:  string
            email: string
            role:  string
          } = await meRes.json()

          return {
            id:           String(me.id),
            name:         me.name,
            email:        me.email,
            role:         me.role,
            accessToken:  data.access_token,
            refreshToken: data.refresh_token,
          }
        } catch {
          // Backend unreachable — deny login
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge:   24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/login",
    error:  "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Store backend tokens and role in the NextAuth JWT
        const u = user as {
          role?: string
          accessToken?: string
          refreshToken?: string
        }
        token.role         = u.role
        token.accessToken  = u.accessToken
        token.refreshToken = u.refreshToken
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        const s = session.user as {
          role?: string
          accessToken?: string
          refreshToken?: string
        }
        s.role         = token.role         as string
        s.accessToken  = token.accessToken  as string
        s.refreshToken = token.refreshToken as string
      }
      return session
    },
  },
}
