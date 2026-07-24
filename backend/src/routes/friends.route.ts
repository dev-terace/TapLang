import { Router } from 'express';
import { addFriend, findFriends, reqFriend } from '../controllers/friends.controller';


const router = Router();

router.get('/:ownId', findFriends);
router.post('/:ownId/:friendId', addFriend);
router.post("/request", reqFriend);

export default router;