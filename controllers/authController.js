const jwt = require("jsonwebtoken");

exports.googleCallback = async (

    req,
    res

) => {

    const user = req.user;

    const accessToken = jwt.sign(

        {

            id: user.id,

            name: user.name,

            email: user.email,

            role: user.role

        },

        process.env.JWT_SECRET,

        {

            expiresIn: "15m"

        }

    );

    const refreshToken = jwt.sign(

        {

            id: user.id

        },

        process.env.JWT_REFRESH_SECRET,

        {

            expiresIn: "7d"

        }

    );

    res.redirect(

        `http://localhost:5173/oauth-success?accessToken=${accessToken}&refreshToken=${refreshToken}`

    );

};