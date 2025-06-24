import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";
import { PrismaAdapter } from '@next-auth/prisma-adapter';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),    
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async signIn({ user }) {
            const email = user.email;

            if (!email) {
                return false;
            }

            // Check if the user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });

            // If the user does not exist, create them
            if (!existingUser) {
                const newUser = await prisma.user.create({
                    data: {
                        email: user.email as string,
                        name: user.name || null,
                    },
                });

                // Create account for new user
                await prisma.account.create({
                    data: {
                        userId: newUser.id, // Use the newly created user's ID
                        provider: "google",
                        providerAccountId: String(user.id), // Convert to string
                    },
                });
            } else {
                // Check if the account already exists
                const existingAccount = await prisma.account.findUnique({
                    where: {
                        provider_providerAccountId: {
                            provider: "google",
                            providerAccountId: String(user.id), // Convert to string
                        },
                    },
                });                

                // If the account does not exist, create it
                if (!existingAccount) {
                    await prisma.account.create({
                        data: {
                            userId: existingUser.id, // Use existing user's ID
                            provider: "google",
                            providerAccountId: String(user.id), // Convert to string
                        },
                    });
                }
            }

            return true;
        },
        async session({ session }) {
            if (session.user) {
                const userRecord = await prisma.user.findUnique({
                    where: { email: session.user.email as string },
                });
                if (userRecord) {
                    session.user.id = userRecord.id.toString(); // Ensure id is string if needed
                }
            }
            return session;
        },
    }
}