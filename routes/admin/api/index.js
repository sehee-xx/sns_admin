const path = require("path");
const router = require("express").Router();

var passport = require("passport");
const api = require("./api.controller");

router.post("/signupProc", api.signupProc);
router.post("/agentChk", api.agentChk);

router.get("/category", api.category);
router.get("/sellproduct", api.sellproduct);
module.exports = router;
