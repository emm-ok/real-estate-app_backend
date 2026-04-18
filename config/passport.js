import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env } from "./env.js";
import { prisma } from "../lib/prisma.js";
import { sendEmail } from "../utils/sendEmail.js";
import { VERIFY_EMAIL_SUCCESS } from "../lib/emailTemplates.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("No email found from Google"), null);
        }

        if (!profile.emails?.[0]?.verified) {
          return done(new Error("Google email not verified"), null);
        }

        const image = profile.photos?.[0]?.value?.replace("=s96-c", "=s400-c");

        let authType;

        let user = await prisma.user.findUnique({
          where: { googleId: profile.id },
        });

        // if user with google id already exist -> LOGIN
        if (user) {
          if (user.status !== "ACTIVE") {
            return done(new Error("Account deactivated"), null);
          }

          authType = "LOGIN";

          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              lastLoginAt: new Date(),
              image: user.image ?? image,
              provider: user.provider ?? "GOOGLE",
              emailVerified: true,
            },
          });
        } else {
          user = await prisma.user.findUnique({
            where: { email },
          });
          // if user with google email already exist -> LINK ACCOUNT
          if (user) {
            if (user.status !== "ACTIVE") {
              return done(new Error("Account deactivated"), null);
            }

            authType = "LINK";

            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                googleId: profile.id,
                provider: user.provider ?? "GOOGLE",
                image: user.image ?? image,
                lastLoginAt: new Date(),
                emailVerified: true,
              },
            });
          } else {
            // if user does not exist -> CREATE USER
            authType = "SIGNUP";

            user = await prisma.user.create({
              data: {
                name: profile.displayName,
                email,
                googleId: profile.id,
                provider: "GOOGLE",
                image,
                emailVerified: true,
              },
            });
          }
          await sendEmail({
            subject: "Email Verification Successful",
            html: VERIFY_EMAIL_SUCCESS.replace(
              "{{LOGIN_URL}}",
              `${env.CLIENT_URL}/sign-in`,
            ),
          });

        }


        return done(null, { ...user, authType });
      } catch (error) {
        console.error("Google Strategy Error", error.message);

        return done(new Error("Google authentication failed"), null);
      }
    },
  ),
);

export default passport;
