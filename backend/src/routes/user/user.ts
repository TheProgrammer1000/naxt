import { Router, Request, Response, NextFunction } from "express"; // ✅
import { pool } from "../../db";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();
const router = Router();

// Extend Express Request to include Multer file
interface MulterRequest extends Request {
    file: multer.File;
}

// ---- Multer Setup ----
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "..", "..", "uploads");
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const userID = req.params.userID;
        const filename = `user_${userID}${ext}`; // overwrite each upload
        cb(null, filename);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error("Only .jpg, .png, .webp allowed"));
    },
});

// GET /users
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [rows] = await pool.query("SELECT * FROM users");
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

router.get(
    "/:userID",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userID = req.params.userID;

            const [rows] = await pool.query(
                "SELECT * FROM users WHERE userID = ?",
                [userID]
            );

            const userFinal =
                Array.isArray(rows) && rows.length > 0 ? rows[0] : null;

            res.json(userFinal);
        } catch (err) {
            next(err);
            res.json({ err: err });
        }
    }
);

router.post(
    "/register",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password, type, name } = req.body as {
                email: string;
                password: string;
                type: string;
                name: string;
            };

            const saltRounds = 12; // bcrypt recommends 10–12 for production
            const passwordHash = await bcrypt.hash(password, saltRounds);

            //     // 3) Store user in DB
            const [result] = await pool.query(
                `INSERT INTO users (email, password_hash, type, name)
           VALUES (?, ?, ?, ?)`,
                [email.toLowerCase(), passwordHash, type, name]
            );

            res.status(201).json({
                message: "User created",
                userId: (result as any).insertId,
            });
        } catch (err) {
            next(err);
        }
    }
);

// ---- POST /login -----------------------------------------------
router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body as {
            email: string;
            password: string;
        };

        console.log("email", email);
        console.log("emapasswordl", password);
        const [rows] = await pool.query(
            "SELECT userID, password_hash, type FROM users WHERE email = ?",
            [email.toLowerCase()]
        );

        const user = (rows as any[])[0];

        // If it user was empty
        if (!user) {
            return res
                .status(401)
                .json({ message: "Invalid email or password." });
        }

        const ok = await bcrypt.compare(password, user.password_hash);

        // If the user typed wrong password or email
        if (!ok) {
            return res
                .status(401)
                .json({ message: "Invalid email or password." });
        }

        res.json({
            message: "Login successful",
            userId: user.userID,
            type: user.type,
            // expiresIn: 4 * 60 * 60, // seconds until expiry (optional)
        });
    } catch (err) {
        next(err);
    }
});

router.post("/verify-token", async (req, res) => {
    const { token } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

        // Simple runtime check
        if (typeof decoded === "object" && decoded && "email" in decoded) {
            const email = (decoded as any).email; // simplest type bypass

            const [rows] = await pool.query(
                "SELECT * FROM users WHERE email = ?",
                [email]
            );

            res.status(200).json({ user: rows });
        } else {
            res.status(400).send("Invalid token payload.");
        }
    } catch (error) {
        res.status(401).send("Invalid token.");
    }
});

// POST /users/img_url/:userID - upload or replace profile image
router.post(
    "/img_url/:userID",
    upload.single("image"),
    async (req: MulterRequest, res: Response, next: NextFunction) => {
        try {
            const { userID } = req.params;
            const file = req.file;
            if (!file)
                return res.status(400).json({ message: "No file uploaded" });
            const ext = path.extname(file.originalname);
            const imgUrl = `/uploads/user_${userID}${ext}`;
            await pool.query(`UPDATE users SET img_url = ? WHERE id = ?`, [
                imgUrl,
                userID,
            ]);
            res.status(200).json({
                message: "Image uploaded successfully",
                img_url: imgUrl,
            });
        } catch (err) {
            next(err);
            res.json({ err: err });
        }
    }
);

router.post("/loggedin", async (req, res, next: NextFunction) => {
    try {
        const { userID } = req.body as {
            userID: Number;
        };

        const [rows] = await pool.query(
            `UPDATE users
                SET loggedin = 1
                WHERE id = ?;`,
            [userID]
        );

        const user = await pool.query(`SELECT * FROM users WHERE id = ?`, [
            userID,
        ]);

        console.log("rows: ", rows);

        res.status(201).json({
            status: "200",
            message: "Updated successfully",
            user: user,
        });
    } catch (err) {
        res.status(500).json({ error: err });
    }
});

router.post("/loggedout", async (req, res, next: NextFunction) => {
    try {
        const { userID } = req.body as {
            userID: Number;
        };

        const [rows] = await pool.query(
            `UPDATE users
                SET loggedin = 0
                WHERE id = ?;`,
            [userID]
        );

        const user = await pool.query(`SELECT * FROM users WHERE id = ?`, [
            userID,
        ]);

        res.status(201).json({
            status: "200",
            message: "Updated successfully",
            user: user,
        });
    } catch (err) {
        res.status(500).json({ error: err });
    }
});

export default router;
