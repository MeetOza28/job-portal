import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.log("MySQL Connection Failed", err.message);
  } else {
    console.log("MySQL Connected");
    // console.log(connection.threadId);
  }
});

const db = connection.promise();

export default db;
