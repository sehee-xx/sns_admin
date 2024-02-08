const path = require('path');
const router = require('express').Router()

const bbs = require('./bbs.controller')

var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();

    let alertMessage = {};
    alertMessage.message = "로그인후 가능합니다.";
    req.flash("alertMessage", alertMessage);
    res.redirect('/login');
};

router.get('/view', isAuthenticated, bbs.view);
router.post('/view', isAuthenticated, bbs.view);

router.post('/modify', isAuthenticated, bbs.modify);


module.exports = router