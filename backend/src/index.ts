import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import usersRouter from "./routes/user/user";
import companyPostRouter from "./routes/company_post/company_post";
import matchingRouter from "./routes/matching/matcing";
import dealsPostRouter from "./routes/deals_post/deals_post";
import dealsRouter from "./routes/deals/deals";

import path from "path";

import cors from "cors";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Mount routes
app.use("/users", usersRouter);
app.use("/company_post", companyPostRouter);
app.use("/matching", matchingRouter);
app.use("/deals_post", dealsPostRouter);
app.use("/deals", dealsRouter);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));
// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: err.message });
});

app.get("/", (req, res) => {
    res.send("200");
});

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.listen(port, () => {
    console.log(`Server listening on http:/localhost:${port}`);
});
