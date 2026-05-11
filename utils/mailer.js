const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendAssignmentEmail = async (to, issueTitle) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: 'New Issue Assigned',

        html: `
            <h2>Issue Assigned</h2>
            <p>You have been assigned a new issue:</p>
            <strong>${issueTitle}</strong>
        `
    });
};

module.exports = {
    sendAssignmentEmail
};