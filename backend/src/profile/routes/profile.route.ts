import { Router } from 'express';
import { upsertProfileDetails, getProfileDetails, getUserProfileDetails } from '../controller/profile.controller';
import { updateOnlineStatusVisibility } from '../controller/profile.controller';
const router = Router();


router.post("/online", updateOnlineStatusVisibility)
router.post("/details", upsertProfileDetails);
router.get("/details", getProfileDetails)
router.get("/details/:userId", getUserProfileDetails)

export default router;