import { Router } from 'express';
import { addFriend, findFriends, reqFriend, findReqFriends } from '../controllers/friends.controller';


const router = Router();

router.get("/request", findReqFriends)
router.post("/request", reqFriend);

router.get('/:ownId', findFriends);
router.post('/:ownId/:friendId', addFriend);


export default router;