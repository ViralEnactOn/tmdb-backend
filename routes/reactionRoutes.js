const express = require("express");
const router = express.Router();
const reactionContoller = require("../controller/reactionController");

router.post("/insert", reactionContoller.insert_reaction);
router.post("/delete", reactionContoller.delete_reaction);

module.exports = router;
