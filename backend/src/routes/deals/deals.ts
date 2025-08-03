import { Router, Request, Response, NextFunction } from "express"; // ✅
import { pool } from "../../db";
import { match } from "assert";

const router = Router();

router.get("/:matcheID", async (req, res, next) => {
    const matcheID = req.params.matcheID;
    try {
        const [result] = await pool.query(
            `SELECT COUNT(matcheID) as count FROM deals WHERE deals.matcheID = ?`,
            [matcheID]
        );

        console.log(result);
        res.json(result);
    } catch (error) {
        res.json({ message: error });
    }
});

router.post("/sign", async (req, res, next) => {
    const { deals_postID, matcheID } = req.body;

    console.log("deals_postID: ", deals_postID);
    console.log("matcheID: ", matcheID);

    try {
        const result = await pool.query(
            `INSERT INTO deals(deals_postID, matcheID) VALUES(?, ?);`,
            [deals_postID, matcheID]
        );

        res.json({ message: "Successfully inserted" });
    } catch (error) {
        res.json({ message: error });
    }
});

export default router;
