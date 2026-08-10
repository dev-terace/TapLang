import { Router } from 'express';
import { updateCountryFlag } from '../controller/country.controller';
const router = Router();

router.patch("/:flag", updateCountryFlag);

export default router;