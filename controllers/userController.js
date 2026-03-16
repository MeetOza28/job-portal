import bcrypt from "bcrypt";
import db from "../config/db.js";

const getProfile = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, is_verified, created_at FROM users WHERE id = ? LIMIT 1",
      [req.user.id]
    );

    if (rows.length == 0) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const user = rows[0];

    return res.status(200).json({ message: "User Fetched", user });
  } catch (error) {
    return res.status(500).json({ message: "Failed to Fetch User", error });
  }
};

const editProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const [rows] = await db.query(
      "SELECT id, name, email, is_verified, created_at FROM users WHERE id = ? LIMIT 1",
      [req.user.id]
    );

    if (rows.length == 0) {
      return res.status(404).json({ message: "User Not Found" });
    }
    if (!name) {
      return res.status(400).json({ message: "Name Required" });
    }

    // if(!rows.is_verified) {
    //     return res.status(400).json({ message: "Email Not Verified"});
    // }

    await db.query("UPDATE users SET name = ? WHERE id = ?", [
      name,
      req.user.id,
    ]);

    return res.status(200).json({ message: "User Updated" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to Update Profile" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      res
        .status(400)
        .json({
          message:
            "Old Password, New Password and Confirm New Password Required",
        });
    }

    if (newPassword.length < 6) {
      res
        .status(400)
        .json({ message: "New Password Length at least 6 characters" });
    }

    if (newPassword === oldPassword) {
      return res
        .status(400)
        .json({ message: "New Password and Old Password Can't be Same" });
    }

    if (newPassword !== confirmNewPassword) {
      return res
        .status(400)
        .json({ message: "New Password And Confirm New Password Not Match" });
    }

    const [rows] = await db.query(
      "SELECT password FROM users WHERE id = ? LIMIT 1",
      [req.user.id]
    );

    if (rows.length == 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];
    // if(!user.is_verified) {
    //     return res.status(400).json({ message: "Email Not Verified"});
    // }
    const match = await bcrypt.compare(oldPassword, user.password);

    if (!match) {
      return res.status(401).json({ message: "Old password incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      hashed,
      req.user.id,
    ]);

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to change password", error });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, is_verified, created_at FROM users WHERE id = ? LIMIT 1",
      [req.user.id]
    );

    if (rows.length == 0) {
      return res.status(404).json({ message: "User Not Found" });
    }

    // if(!rows.is_verified) {
    //     return res.status(400).json({ message: "Email Not Verified"});
    // }
    await db.query("DELETE FROM users WHERE id = ?", [req.user.id]);

    return res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete account", error });
  }
};

export { getProfile, editProfile, changePassword, deleteAccount };
