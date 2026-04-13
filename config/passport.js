import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env } from "./env.js";
import { prisma } from "../lib/prisma.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
    },
    async (profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("No email found from Google"), null);
        }

        const image = profile.photos?.[0]?.value.replace("=s96-c", "=s400-c");

        let user = await prisma.user.findUnique({
          where: { googleId: profile.id },
        });

        if (!user) {
          user = await prisma.user.findUnique({
            where: { email },
          });
        }

        if (!user) {
          user = await prisma.user.create({
            data: {
              name: profile.displayName,
              email,
              googleId: profile.id,
              provider: "GOOGLE",
              image,
            },
          });
        } else {
          // sync google image if missing
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              ...(user.googleId ? {} : { googleId: profile.id }),
              ...(user.provider ? {} : { provider: "GOOGLE" }),
              ...(user.image ? {} : { image }),
            },
          });
        }

        if (!profile.emails?.[0].verified) {
          return done(new Error("Google account email not verified"));
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    },
  ),
);


export default passport;