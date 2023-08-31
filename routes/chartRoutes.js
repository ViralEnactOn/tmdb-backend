const express = require("express");
const router = express.Router();
const chartController = require("../controller/chartController");

router.post("/genre_wise_rating", chartController.genres_rating);
router.post("/week_wise_release", chartController.movie_chart);
router.post("/revenue", chartController.movie_profit_loss);
router.post("/country_revenue", chartController.movie_country_revenue);

module.exports = router;
