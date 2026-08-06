import { Router } from 'express';
import { addFriend, findFriends, reqFriend, findReqFriends, deleteFriendRequest } from '../controllers/friends.controller';


const router = Router();

router.get("/request", findReqFriends);
router.post("/request", reqFriend);

router.get('/', findFriends);
router.delete("/request/:friendId/:self", deleteFriendRequest);
router.post('/request/:friendId', addFriend);


export default router;