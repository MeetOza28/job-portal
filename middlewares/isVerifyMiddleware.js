import db from "../config/db.js";

const isVerify = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      "SELECT is_verified FROM users WHERE id = ? LIMIT 1",
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    if (rows[0].is_verified === 0) {
      return res.status(403).json({ message: "Email Not Verified" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};

export default isVerify;
