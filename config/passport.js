const passport = require("passport");

const GoogleStrategy = require("passport-google-oauth20").Strategy;

const {
    findUserByEmail,
    addUser
} = require("../models/userModel");

passport.use(

    new GoogleStrategy(

        {

            clientID: process.env.GOOGLE_CLIENT_ID,

            clientSecret: process.env.GOOGLE_CLIENT_SECRET,

            callbackURL: "http://localhost:2005/api/v1/auth/google/callback"

        },

        async (

            accessToken,
            refreshToken,
            profile,
            done

        ) => {

            try {

                let user =
                    await findUserByEmail(
                        profile.emails[0].value
                    );

                if (!user) {

                    const newUser = {

                        id: Date.now(),

                        name: profile.displayName,

                        email: profile.emails[0].value,

                        password: "",

                        role: "DEVELOPER",

                        is_verified: true

                    };

                    await addUser(newUser);

                    user = newUser;

                }

                return done(

                    null,

                    user

                );

            } catch (err) {

                return done(

                    err,
                    null

                );

            }

        }

    )

);

passport.serializeUser(

    (user, done) => {

        done(

            null,
            user.id

        );

    }

);

passport.deserializeUser(

    async (id, done) => {

        done(

            null,

            {
                id
            }

        );

    }

);

module.exports = passport;