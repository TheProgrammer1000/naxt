import { Router, Request, Response, NextFunction } from "express"; // ✅
import { pool } from "../../db";
import multer from "multer";
import path from "path";
import fs from "fs";

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

        // 👇 grab companyID, not userID
        const { companyID } = req.params;

        if (!companyID) {
            return cb(new Error("companyID is missing in params"), "");
        }

        // 👇 name it company_<companyID>.<ext>
        const filename = `company_${companyID}${ext}`;
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

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [resultSets] = await pool.execute(
            "CALL getAllCompanyPostsAndUser()"
        );
        res.status(200).json(resultSets[0]);
    } catch (err) {
        next(err);
    }
});

router.get(
    "/all/:userID",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userID = req.params.userID;

            const [rows] =
                await pool.query(`SELECT * FROM matching, company_post, users
                                WHERE matching.companyID = company_post.id
                                AND users.id = company_post.userID
                                AND users.id = ${userID};`);

            if (!rows) {
                return res.status(401).json({ message: "Invalid! " });
            }

            res.status(200).json(rows);
        } catch (err) {
            next(err);
        }
    }
);

router.get(
    "/liked/:userID",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userID = req.params.userID;

            const [rows] =
                await pool.query(`SELECT * FROM matching, company_post, users
                                WHERE matching.companyID = company_post.id
                                AND users.id = company_post.userID
                                AND users.id = ${userID}
                                AND matching.likes = 1;`);

            if (!rows) {
                return res.status(401).json({ message: "Invalid! " });
            }

            res.status(200).json(rows);
        } catch (err) {
            next(err);
        }
    }
);

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            userIDCompany,
            company_name,
            company_city,
            company_employees,
            company_industry,
            description,
        } = req.body as {
            userIDCompany: Number;
            company_name: string;
            company_city: string;
            company_employees: Number;
            company_industry: string;
            description: string;
        };

        // //     // 3) Store user in DB
        const [result] = await pool.query(
            `INSERT INTO company_post(userIDCompany, company_name, company_city, company_employees, company_industry, description)
           VALUES (?, ?, ?, ?, ?, ?)`,
            [
                userIDCompany,
                company_name,
                company_city,
                company_employees,
                company_industry,
                description,
            ]
        );

        res.status(201).json({
            message: "company_post created",
            result: result as any,
        });
    } catch (err) {
        next(err);
    }
});

router.post(
    "/img_url/:companyID",
    upload.single("image"),
    async (req: MulterRequest, res: Response, next: NextFunction) => {
        try {
            const { companyID } = req.params;
            const file = req.file;
            if (!file) {
                return res.status(400).json({ message: "No file uploaded" });
            }

            const ext = path.extname(file.originalname);
            const imgUrl = `/uploads/company_${companyID}${ext}`;

            await pool.query(
                `UPDATE company_post
                    SET img_url = ?
                    WHERE companyID = ?`,
                [imgUrl, companyID]
            );

            res.status(200).json({
                message: "Company image uploaded successfully",
                img_url: imgUrl,
            });
        } catch (err) {
            next(err);
        }
    }
);

export default router;
