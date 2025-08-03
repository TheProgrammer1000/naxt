import { Router, Request, Response, NextFunction } from "express"; // ✅
import { pool } from "../../db";
import { match } from "assert";

const router = Router();

router.get("/:matcheID", async (req, res, next) => {
    const matcheID = req.params.matcheID;

    try {
        const [result] = await pool.query(
            `SELECT COUNT(matcheID) as count FROM deals_post WHERE matcheID = ${matcheID};`
        );

        res.json(result);
    } catch (error) {
        res.json({ message: error });
    }
});

router.post("/insert", async (req, res, next) => {
    const { matchingID, deal_price, deal_procentage } = req.body;

    try {
        const [result] = await pool.execute(
            `CALL addDealPost(${matchingID}, ${deal_price}, ${deal_procentage});`
        );
        1;
        res.json({ message: "Successfully inserted", result });
    } catch (error) {
        res.json({ message: error });
    }
});

router.get("/getDeals/:userID", async (req, res, next) => {
    const userID = req.params.userID;

    try {
        const [result] = await pool.query(
            `SELECT deal_price, deal_procentage, matcheID, companyID FROM matche, deals_post 
                WHERE matche.id = deals_post.matcheID
                AND matche.userID = ${userID};`
        );

        console.log("result: ", result);

        res.json(result);
    } catch (error) {
        res.json({ message: error });
    }
});

router.get("/dealToUser/:userID", async (req, res, next) => {
    const userID = req.params.userID;

    try {
        const [result] = await pool.query(
            `SELECT company_name, deal_price, deal_procentage, d.email, a.id as deals_postID, b.id as matcheID FROM deals_post a
                JOIN matche b ON a.matcheID = b.id
                JOIN company_post c ON c.id = b.companyID
                JOIN users d ON d.id = c.userID
                WHERE b.userID = ${userID};
`
        );

        console.log("result: ", result);

        res.json(result);
    } catch (error) {
        res.json({ message: error });
    }
});

router.get("/getInvestorPostDealsOnly/:userID", async (req, res, next) => {
    const userID = req.params.userID;

    try {
        const [resultSets] = await pool.execute(
            "CALL getInvestorPostDealsOnly(?)",
            [userID]
        );

        console.log("resultSets[0]: ", resultSets[0]);

        res.json(resultSets[0]);
    } catch (error) {
        res.json({ message: error });
    }
});

router.post("/sign", async (req, res, next) => {
    const { userID, deals_postID } = req.body;

    console.log("deals_postID: ", deals_postID);
    console.log("userID: ", userID);

    try {
        const [result] = await pool.execute(
            `CALL makingAnDeal(${userID}, ${deals_postID});`
        );

        res.status(200).json({ message: "Successfully inserted" });
    } catch (error) {
        res.json({ message: error });
    }
});

/* 


   
    ); */

export default router;
