import { Router } from 'express';
import { upsertProfileDetails, getProfileDetails, getUserProfileDetails, checkUsernameTag, updateStatusMessage } from '../controller/profile.controller';
import { updateOnlineStatusVisibility } from '../controller/profile.controller';

const router = Router();


router.post("/online", updateOnlineStatusVisibility)
router.post("/details", upsertProfileDetails);
router.get("/tag", checkUsernameTag)
router.get("/details", getProfileDetails)
router.patch('/status',  updateStatusMessage);
router.get("/details/:userId", getUserProfileDetails)

export default router;