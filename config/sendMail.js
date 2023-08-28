const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "tmdbclone@gmail.com",
        pass: "shlbakqhkfsxkwwd",
      },
    });

    await transporter.sendMail({
      from: "tmdbclone@gmail.com",
      to: email,
      subject: subject,
      html: `<!DOCTYPE html>
      <html>
        <body>
          <div
            style="font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow: auto; line-height: 2"
          >
            <div
              style="margin: 50px auto; width: 70%; padding: 20px 0"
            >
              <div
                style="border-bottom: 1px solid #eee"
              >
                <div
                  
                  style="font-size: 1.4em; color: #00466a; text-decoration: none; font-weight: 600"
                >
                  TMDB
                </div>
              </div>
              <p style="font-size: 1.1em">Hi,</p>
              <p>
                Thank you for choosing TMDB. Use the following to complete your Sign Up procedures.
              </p>
      
              <h2
              style="background: #00466a; margin: 0 auto; width: max-content; padding: 0 10px; color: #fff; border-radius: 4px;"
            >
              <a
                style="text-decoration: none; color: #fff; border-radius: 4px; display: inline-block; background: #00466a; padding: 0 10px;"
                href=${text}
              >
                Verify your account
              </a>
            </h2>
      
              <p style="font-size: 0.9em">
                Regards,<br />TMDB
              </p>
              <hr style="border: none; border-top: 1px solid #eee" />
            </div>
          </div>
        </body>
      </html>
      `,
    });
    console.log("email sent sucessfully");
  } catch (error) {
    console.log("email not sent");
    console.log(error);
  }
};

const forgotEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "tmdbclone@gmail.com",
        pass: "shlbakqhkfsxkwwd",
      },
    });

    await transporter.sendMail({
      from: "tmdbclone@gmail.com",
      to: email,
      subject: subject,
      html: `<!DOCTYPE html>
      <html>
        <body>
          <div
            style="font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow: auto; line-height: 2"
          >
            <div
              style="margin: 50px auto; width: 70%; padding: 20px 0"
            >
              <div
                style="border-bottom: 1px solid #eee"
              >
                <div
                  
                  style="font-size: 1.4em; color: #00466a; text-decoration: none; font-weight: 600"
                >
                  TMDB
                </div>
              </div>
              <p style="font-size: 1.1em">Hi,</p>
              <p>
                Thank you for choosing TMDB. Use the following to complete your reset password procedures.
              </p>
      
              <h2
              style="background: #00466a; margin: 0 auto; width: max-content; padding: 0 10px; color: #fff; border-radius: 4px;"
            >
              <a
                style="text-decoration: none; color: #fff; border-radius: 4px; display: inline-block; background: #00466a; padding: 0 10px;"
                href=${text}
              >
                Reset your password
              </a>
            </h2>
      
              <p style="font-size: 0.9em">
                Regards,<br />TMDB
              </p>
              <hr style="border: none; border-top: 1px solid #eee" />
            </div>
          </div>
        </body>
      </html>
      `,
    });
    console.log("email sent sucessfully");
  } catch (error) {
    console.log("email not sent");
    console.log(error);
  }
};

module.exports = { sendEmail, forgotEmail };
