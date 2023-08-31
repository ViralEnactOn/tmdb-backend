const express = require("express");
const router = express.Router();
const { movieController } = require("../controller/index");

router.get("/getall", movieController.getAll);
router.get("/pagination", movieController.pagination);

module.exports = router;
