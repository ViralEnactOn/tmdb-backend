const express = require("express");
const router = express.Router();
const { chartController } = require("../controller/index");

router.post("/genre_wise_rating", chartController.movieGenresRating);
router.post("/week_wise_release", chartController.movieDetailChart);
router.post("/revenue", chartController.movieRevenue);
router.post("/country_revenue", chartController.movieRevenueCountryWise);

module.exports = router;
