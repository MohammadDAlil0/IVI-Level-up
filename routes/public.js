const express = require('express');
const publicControllers = require("../controllers/public");

const router = express.Router();


router.get('/getProfile', publicControllers.getProfileInfo);

router.get('/searchForUser', publicControllers.searchForUser)

module.exports = router;