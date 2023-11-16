const express = require('express');
const isAuth = require('../middleware/is-auth');

const userControllers = require('../controllers/user');
const userValidators = require('../validators/userValidators');

const router = express.Router();

router.post('/addfolder', isAuth, userValidators.addFloder, userControllers.postAddFolder);

router.delete('/removeFolder/:folderId', isAuth, userValidators.removeFolder, userControllers.removeFolder);

router.post('/addProblem', isAuth, userValidators.addProblem, userControllers.postAddProblem);

router.delete('/removeProblem/:folderId/:problemId', isAuth, userValidators.removeProblem, userControllers.removeProblem)

router.get('/getFolders', isAuth, userControllers.getFolders);

router.post('/addFriend', isAuth, userValidators.addFriend, userControllers.postAddFriend);

router.put('/addBio', isAuth, userControllers.addBio);

router.get('/getProfileInfo/:id', isAuth, userControllers.getProfileInfo);

router.get('/getProfileInfo', isAuth, userControllers.getProfileInfo);

router.get('/suggestProblems', isAuth, userControllers.suggestProblems);

router.put('/editProblemVotes', isAuth, userValidators.editProblemVotes, userControllers.editProblemVotes)

router.post('/addHint', isAuth, userValidators.addHint, userControllers.addHint);

router.put('/buyHint', isAuth, userControllers.buyHint);

module.exports = router;