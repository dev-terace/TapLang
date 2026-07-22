import { Router } from 'express';
import { addFriend, findFriends } from '../controllers/friends.controller';

const router = Router();

router.get('/:ownId', findFriends);
router.post('/:ownId/:friendId', addFriend);

export default router;