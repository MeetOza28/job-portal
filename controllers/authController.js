import crypto from "crypto";
import db from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/mail.js";
import validator from "validator";
import dotenv from "dotenv";
dotenv.config();

const generateToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

const createJWT = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// const normalizeEmail = (email) => {
//     if(!email) return "";
//     return validator.normalizeEmail(email, {gmail_remove_dots: false}) || email;
// }

const isValidEmail = (email) => validator.isEmail(email || "");

const authRegister = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);

    if (existing.length > 0) {
      return res.status(409).json({ message: "Email Already Exists" });
    }

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields must be required" });
    }

    // email = normalizeEmail(email);

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Password And Confirm Password Not Match" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      "INSERT INTO users (name, email, password) VALUES (?,?,?)",
      [name, email, hashedPassword]
    );

    // console.log(result);

    const userId = result.insertId;
    const token = generateToken();
    const expires_at = new Date(Date.now() + 15 * 60 * 1000);

    await db.query(
      "INSERT INTO email_verification (user_id, token, expires_at) VALUES (?, ?, ?)",
      [userId, token, expires_at]
    );

    const verifyLink = `${process.env.FRONTEND_URL}/api/auth/email-verify?token=${token}`;

    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: "Verify Email",
      html: `
                <h3>Verify Your Email</h3>
                <p>Click the link below to verify your email</p>
                <a href="${verifyLink}">${verifyLink}</a>
                <p>This link expires in 15 minutes</p>
            `,
    });

    return res.status(201).json({
      message: "Registered Successfully. Email Verification Pending"
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Register Failed", error: error.message });
  }
};

const authSendEmailAfterExpire = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email must be required", error });
    }

    // email = normalizeEmail(email);

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const [result] = await db.query(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (result.length == 0) {
      return res.status(404).json({ message: "Email Not Found", error });
    }

    // console.log(result);

    const user = result[0];

    if (user.is_verified) {
      return res.status(400).json({ message: "Email Already Verified" });
    }

    await db.query("DELETE FROM email_verification WHERE user_id = ?", [
      user.id,
    ]);
    const userId = user.id;
    const token = generateToken();
    const expires_at = new Date(Date.now() + 15 * 60 * 1000);

    await db.query(
      "INSERT INTO email_verification (user_id, token, expires_at) VALUES (?, ?, ?)",
      [userId, token, expires_at]
    );

    const verifyLink = `${process.env.FRONTEND_URL}/api/auth/email-verify?token=${token}`;

    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: user.email,
      subject: "Verify Email",
      html: `<h3>Verify Your Email</h3>
                <p>Click the link below to verify your email</p>
                <a href="${verifyLink}">${verifyLink}</a>
                <p>This link expires in 15 minutes</p>`,
    });

    return res.status(200).json({ message: "Verify Email Link Resent" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to Sent Email Verification Link", error });
  }
};

const authEmailVerification = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const [rows] = await db.query(
      "SELECT * FROM email_verification WHERE token = ? LIMIT 1",
      [token]
    );

    if (rows.length == 0) {
      return res.status(400).json({ message: "Invalid Token" });
    }

    // console.log(rows);

    const verification = rows[0];

    if (new Date(verification.expires_at) < new Date()) {
      // await db.query("DELETE FROM email_verification WHERE token = ?", [verification.token]);
      return res.status(400).json({ message: "Token Expired" });
    }

    await db.query("UPDATE users SET is_verified = true WHERE id = ?", [
      verification.user_id,
    ]);

    await db.query("DELETE FROM email_verification WHERE user_id = ?", [
      verification.user_id,
    ]);

    return res.status(200).json({ message: "Email Verification Successful" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Email Verification Failed", error });
  }
};

const authLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (rows.length == 0) {
      return res.status(404).json({ message: "Email Not Found" });
    }

    // email = normalizeEmail(email);

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // console.log(rows);

    const user = rows[0];

    // if(!user.is_verified) {
    //     return res.status(400).json({ message: "Email Not Verified"});
    // }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Password Invalid" });
    }

    const token = createJWT({ id: user.id, email: user.email });

    return res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error });
  }
};

const authForgot = async (req, res) => {
  try {
    const { email } = req.body;

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (rows.length == 0) {
      return res.status(404).json({ message: "Email Not Found" });
    }

    // email = normalizeEmail(email);

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // console.log(rows);

    const user = rows[0];

    const userId = user.id;
    const token = generateToken();
    const expires_at = new Date(Date.now() + 15 * 60 * 1000);

    await db.query(
      "INSERT INTO password_resets (user_id, token, expires_at) VALUES (?,?,?)",
      [userId, token, expires_at]
    );

    const resetLink = `${process.env.FRONTEND_URL}/api/auth/reset-password?token=${token}`;

    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: "Reset-password",
      html: `
                <h3>Reset Password</h3>
                <p>Click below to reset your password:</p>
                <a href="${resetLink}">${resetLink}</a>
                <p>This link expires in 15 minutes.</p>
            `,
    });

    res.status(200).json({ message: "Reset Link Sent" });
  } catch (error) {
    res.status(500).json({ message: "Forgot Password Failed", error });
  }
};

const authReset = async (req, res) => {
  try {
    const { token, newPassword, confirmNewPassword } = req.body;

    const [rows] = await db.query(
      "SELECT * FROM password_resets WHERE token = ? LIMIT 1",
      [token]
    );

    if (rows.length == 0) {
      return res.status(400).json({ message: "Invalid Token" });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        message: "New Password and Confirm New Password Must be Same",
      });
    }
    // console.log(rows);

    const reset = rows[0];

    if (new Date(reset.expires_at) < new Date()) {
      // await db.query("DELETE FROM password_resets WHERE token = ?", [reset.token]);
      return res.status(400).json({ message: "Token Expired" });
    }
    const hashed = await bcrypt.hash(newPassword, 10);

    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      hashed,
      reset.user_id,
    ]);
    await db.query("DELETE FROM password_resets WHERE user_id = ?", [
      reset.user_id,
    ]);

    return res.status(200).json({ message: "Password Reset Successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Password Reset Failed", error });
  }
};

const authLogout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(400).json({ message: "No Token Provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.decode(token);

    const expiresAt = new Date(decoded.exp * 1000);

    await db.query(
      "INSERT INTO token_blacklist (token, expires_at) VALUES (?,?)",
      [token, expiresAt]
    );

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Logout failed", error });
  }
};

export {
  generateToken,
  createJWT,
  authRegister,
  authSendEmailAfterExpire,
  authEmailVerification,
  authLogin,
  authForgot,
  authReset,
  authLogout,
};
