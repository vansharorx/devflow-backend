const passport = require("passport");

const GoogleStrategy = require("passport-google-oauth20").Strategy;

const {
    findUserByEmail,
    addUser
} = require("../models/userModel");

if (
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET
) {

    passport.use(

        new GoogleStrategy(

            {

                clientID: process.env.GOOGLE_CLIENT_ID,

                clientSecret: process.env.GOOGLE_CLIENT_SECRET,

                callbackURL: process.env.GOOGLE_CALLBACK_URL

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

                }
                catch (err) {

                    return done(

                        err,
                        null

                    );

                }

            }

        )

    );

}
else {

    console.warn(
        "⚠ Google OAuth is disabled because GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing."
    );

}

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