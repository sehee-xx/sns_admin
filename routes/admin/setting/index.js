const path = require('path');
const router = require('express').Router()

var passport = require('passport');
const st = require('./st.controller')
const rtnUtil    = require(path.join(process.cwd(),'/routes/services/rtnUtil'))
const logUtil = require(path.join(process.cwd(),'/routes/services/logUtil'))

var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();

    let alertMessage = {};
    alertMessage.message = "로그인후 가능합니다.";
    req.flash("alertMessage", alertMessage);
    res.redirect('/login');
};

router.get('/config', isAuthenticated, st.config)
router.post('/config', isAuthenticated, st.config)

router.post('/saveConfig', isAuthenticated, st.saveConfig)

router.post('/productcd', isAuthenticated, st.viewProductCd)
router.post('/setProductCode', isAuthenticated, st.setProductCode)



router.get('/cmmcd', isAuthenticated, st.VCommCodeMst)
router.post('/cmmcd', isAuthenticated, st.VCommCodeMst)

router.post('/cmmcdDtl', isAuthenticated,  st.VCommCodeDtl)

router.post('/setCommCodeMst', isAuthenticated,  st.setCommCodeMst)
router.post('/setCommCodeDtl',  isAuthenticated, st.setCommCodeDtl)

router.post('/pushAPI', isAuthenticated, st.pushAPI)

module.exports = router