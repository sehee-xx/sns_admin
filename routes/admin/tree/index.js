const path = require('path');
const router = require('express').Router()
const ct = require('./tree.controller')
var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/ad/login');
};

router.post('/binary', ct.binary);
router.get('/binary', ct.binary);

router.get('/wrap', ct.view);
router.post('/wrap', isAuthenticated, ct.view);


module.exports = router