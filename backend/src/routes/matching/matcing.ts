import { Router, Request, Response, NextFunction } from "express"; // ✅
import { pool } from "../../db";
import { User } from "../../../../react-native/lib/types/user";

const router = Router();

// GET /users
router.get(
    "/getSaved/:userID",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userID = req.params.userID;

            const [result] = await pool.execute(
                `CALL getInvestorSavedCompanies(${userID});`
            );

            const data = result[0];
            res.status(200).json(data);
        } catch (err) {
            next(err);
            res.json({ error: err });
        }
    }
);

router.post(
    "/saved",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userIDInvestor, companyID } = req.body as {
                userIDInvestor: number;
                companyID: number;
            };

            const [result] = await pool.execute(
                `CALL InvestorSaveCompanyPost(${companyID}, ${userIDInvestor})`
            );

            console.log("result: ", result);

            res.status(201).json({
                message: "Successfully inserted!",
                data: result,
            });
        } catch (err) {
            next(err);
            res.json({ error: err });
        }
    }
);

router.post(
    "/likes",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userIDInvestor, companyID } = req.body as {
                userIDInvestor: number;
                companyID: number;
            };

            const [result] = await pool.execute(
                `CALL InvestorLikeCompanyPost(${companyID}, ${userIDInvestor})`
            );

            res.status(201).json({ message: "Successfully inserted!" });
        } catch (err) {
            next(err);
            res.json({ error: err });
        }
    }
);

router.get(
    "/likes/:userID",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userID = req.params.userID;

            const [result] = await pool.execute(
                `CALL getAllLikesOnCompany(${userID});`
            );

            const data = result[0];
            res.status(200).json(data);
        } catch (err) {
            next(err);
            res.json({ error: err });
        }
    }
);

router.post(
    "/addMatch",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { companyID, userIDInvestor } = req.body as {
                companyID: number;
                userIDInvestor: number;
            };

            console.log("companyID: ", companyID);
            console.log("userIDInvestor: ", userIDInvestor);

            const [result] = await pool.execute(
                `CALL addMatched(${companyID}, ${userIDInvestor});`
            );
            res.status(201).json({
                status: 200,
                message: "Successfully updated!",
            });
        } catch (err) {
            next(err);
            res.json({ error: err });
        }
    }
);

router.get(
    "/getAllMatches/:userID/:userType",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userID, userType } = req.params;

            const [rows] = await pool.execute(
                `CALL getAllMatches(${userID}, '${userType}');`
            );
            const data = rows[0];

            res.status(200).json(data);
        } catch (err) {
            next(err);
            res.json({ error: err });
        }
    }
);

router.get(
    "/getCompanyMatches/:userID",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userID = req.params.userID;

            console.log("userID: ", userID);

            const [result] = await pool.execute(
                `CALL getCompanyMatches(${userID});`
            );

            const data = result[0];

            res.status(200).json(data);
        } catch (err) {
            res.json({ error: err });
            next(err);
        }
    }
);

router.delete(
    "/deleteSaved/:companyID",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const companyID = req.params.companyID;

            const [result] = await pool.query(
                `DELETE FROM matching WHERE companyID = ${companyID};`
            );

            res.status(201).json(result);
        } catch (err) {
            next(err);
            res.json({ error: err });
        }
    }
);

export default router;
