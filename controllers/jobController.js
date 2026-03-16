import db from "../config/db.js";
import slugify from "../utils/slugify.js";
import formidable from "formidable";
import fs from "fs";
import path from "path";

const createJob = async (req, res) => {
  try {
    const form = formidable({
      multiples: false,
      keepExtensions: true,
      allowEmptyFiles: false,
      minFileSize: 1,
      maxFileSize: 4 * 1024 * 1024,
      firstValues: true,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ message: "Error parsing in image" });
      }

      console.log("Fields", fields);
      console.log("Files", files);

      req.body = {};
      for (const key in fields) {
        req.body[key] = Array.isArray(fields[key])
          ? fields[key][0]
          : fields[key];
      }

      const {
        job_title,
        job_description,
        company_name,
        city,
        country,
        salary,
        job_type,
        experience_level,
        is_active = true,
        is_featured = false,
      } = req.body;

      console.log(req.body);

      if (
        !job_title ||
        !job_description ||
        !company_name ||
        !city ||
        !country ||
        !job_type ||
        !experience_level
      ) {
        return res
          .status(400)
          .json({ message: "All required fields must be provided" });
      }

      if (!files.image) {
        return res.status(400).json({ message: "Image must be provided" });
      }

      if (!["full-time", "part-time"].includes(job_type)) {
        return res
          .status(400)
          .json({ message: "Job type must be full-time or part-time" });
      }

      if (!["fresher", "junior", "mid", "senior"].includes(experience_level)) {
        return res.status(400).json({ message: "Experience level invalid" });
      }

      // const uploadDir = "../uploads";
      const uploadDir = path.join(process.cwd(), "uploads");

      if (fs.existsSync(uploadDir) == false) {
        fs.mkdirSync(uploadDir);
      }

      // const newFile = files.file;
      let newPath = null;

      if (files.image) {
        const f = Array.isArray(files.image) ? files.image[0] : files.image;
        if (f.size > 4 * 1024 * 1024) {
          return res
            .status(400)
            .json({ message: "Image size should be <= 4MB" });
        }

        const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
        if (!allowedTypes.includes(f.mimetype)) {
          return res.status(400).json({ message: "Invalid image type" });
        }

        const oldPath = f.filepath;
        // newPath = `/uploads/${f.originalFilename}`;

        const fileName = `${f.originalFilename}`;
        const savePath = path.join(uploadDir, fileName);

        fs.renameSync(oldPath, savePath);

        newPath = `/uploads/${f.originalFilename}`;
      }

      let slug = slugify(job_title);

      slug = slug + "-" + Date.now();

      await db.query(
        "INSERT INTO jobs (user_id,job_title,slug,job_description,company_name,city,country,salary,job_type,experience_level,is_active,is_featured,image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          req.user.id,
          job_title,
          slug,
          job_description,
          company_name,
          city,
          country,
          salary,
          job_type,
          experience_level,
          is_active,
          is_featured,
          newPath,
        ],
      );

      return res
        .status(201)
        .json({ message: "Job created successfully", slug });
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create job", error });
  }
};

const updateJob = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      "SELECT * FROM jobs WHERE id = ? and user_id = ? LIMIT 1",
      [id, req.user.id],
    );

    if (rows.length == 0) {
      return res.status(404).json({ message: "Job not found" });
    }

    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(500).json({ message: "Error parsing form" });

      req.body = {};
      for (const key in fields) {
        req.body[key] = Array.isArray(fields[key])
          ? fields[key][0]
          : fields[key];
      }

      const updateData = { ...req.body };

      if (updateData.job_title) {
        updateData.slug = slugify(updateData.job_title) + "-" + Date.now();
      }

      const uploadDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
      }

      // console.log("fields", fields);
      // console.log("files", files);

      if (files.image) {
        const f = Array.isArray(files.image) ? files.image[0] : files.image;

        if (f.size > 4 * 1024 * 1024) {
          return res
            .status(400)
            .json({ message: "Image size should be <= 4MB" });
        }

        const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
        if (!allowedTypes.includes(f.mimetype)) {
          return res.status(400).json({ message: "Invalid image type" });
        }

        const oldPath = f.filepath;
        const fileName = `${f.originalFilename}`;
        const savePath = path.join(uploadDir, fileName);

        fs.renameSync(oldPath, savePath);

        updateData.image = `/uploads/${f.originalFilename}`;
      }

      await db.query("UPDATE jobs SET ? WHERE id = ? AND user_id = ?", [
        updateData,
        parseInt(id),
        req.user.id,
      ]);

      return res.status(200).json({ message: "Job updated successfully" });
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update job", error });
  }
};

const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      "SELECT * FROM jobs WHERE id = ? AND user_id = ?",
      [id, req.user.id],
    );

    if (rows.length == 0) {
      return res.status(404).json({ message: "Job Not Found" });
    }

    await db.query("DELETE FROM jobs WHERE id = ? LIMIT 1", [id]);

    return res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete job", error });
  }
};

const getMyJob = async (req, res) => {
  try {
    const [jobs] = await db.query(
      "SELECT * FROM jobs WHERE user_id = ? ORDER BY id DESC",
      [req.user.id],
    );

    return res.status(200).json({ message: "My jobs fetched", jobs });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch jobs", error });
  }
};

const listPublicJob = async (req, res) => {
  try {
    let { page = 1, limit = 5 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const offset = (page - 1) * limit;

    const [jobs] = await db.query(
      "SELECT job_title, slug, company_name, city, country, salary, job_type, experience_level, is_featured FROM jobs WHERE is_active = true ORDER BY is_featured DESC, id DESC LIMIT ? OFFSET ?",
      [limit, offset],
    );

    const [count] = await db.query(
      "SELECT COUNT(*) AS Total FROM jobs WHERE is_active=true",
    );

    console.log(count);

    return res.status(200).json({
      message: "Public jobs fetched",
      page,
      limit,
      total: count[0].Total,
      jobs,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch jobs", error });
  }
};

const searchPublicJobs = async (req, res) => {
  try {
    let {
      q = "",
      city = "",
      country = "",
      job_type = "",
      experience_level = "",
      page = 1,
      limit = 5,
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    let whereClause = "WHERE is_active = true";
    let values = [];

    if (q) {
      whereClause += " AND (job_title LIKE ? OR company_name LIKE ?)";
      values.push(`%${q}%`, `%${q}%`);
    }

    if (city) {
      whereClause += " AND city LIKE ?";
      values.push(`%${city}%`);
    }

    if (country) {
      whereClause += " AND country LIKE ?";
      values.push(`%${country}%`);
    }

    if (job_type) {
      whereClause += " AND job_type = ?";
      values.push(job_type);
    }

    if (experience_level) {
      whereClause += " AND experience_level = ?";
      values.push(experience_level);
    }

    const [jobs] = await db.query(
      `SELECT id, job_title, slug, company_name, city, country, salary, job_type, experience_level, is_featured
       FROM jobs
       ${whereClause}
       ORDER BY is_featured DESC, id DESC
       LIMIT ? OFFSET ?`,
      [...values, limit, offset],
    );

    const [count] = await db.query(
      `SELECT COUNT(*) AS Total FROM jobs ${whereClause}`,
      values,
    );

    return res.status(200).json({
      message: "Search jobs fetched successfully",
      page,
      limit,
      total: count[0].Total,
      jobs,
    });
  } catch (error) {
    return res.status(500).json({ message: "Search failed", error });
  }
};

const getJobBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // const [user] = await db.query("SELECT is_verified FROM users WHERE id = ?", [req.user.id]);

    // if(!user.is_verified) {
    //     return res.status(400).json({ message: "Email Not Verified"});
    // }

    const [rows] = await db.query(
      "SELECT job_title, slug, job_description, company_name, city, country, salary, job_type, experience_level FROM jobs WHERE slug=? AND is_active=true LIMIT 1",
      [slug],
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Job not found" });

    const job = rows[0];

    return res.status(200).json({ message: "Job details fetched", job });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch job details", error });
  }
};

export {
  createJob,
  updateJob,
  deleteJob,
  getMyJob,
  listPublicJob,
  getJobBySlug,
  searchPublicJobs,
};
