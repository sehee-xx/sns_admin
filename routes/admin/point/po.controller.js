const path = require('path');
const Mydb = require(path.join(process.cwd(), '/routes/config/mydb'))
const Query = require('./po.sqlmap');
const cmmQuery = require(path.join(process.cwd(), '/routes/admin/setting/st.sqlmap'));

const rtnUtil = require(path.join(process.cwd(), '/routes/services/rtnUtil'))
const logUtil = require(path.join(process.cwd(), '/routes/services/logUtil'))
const encUtil = require(path.join(process.cwd(), '/routes/services/encUtil'));
const pagingUtil = require(path.join(process.cwd(), '/routes/services/pagingUtil'))


let isNullOrEmpty = require('is-null-or-empty');
const moment = require('moment');
const {v4: uuidv4} = require('uuid');

/*
 * properties
 */
const PropertiesReader = require("properties-reader");
const properties = PropertiesReader("adm.properties");

exports.view = async (req, res, next) => {
    let pool = req.app.get("pool");
    let mydb = new Mydb(pool);
    let {pageIndex, rowsPerPage,  srchOption, srchText, srchMember, srtDt, endDt} = req.body;

    if (isNullOrEmpty(pageIndex)) {
        pageIndex = 1;
    }
    if (rowsPerPage == "" || rowsPerPage == null) {
        rowsPerPage = 10;
    }

    let _date = moment(new Date());
    let yester = moment(new Date()).subtract(30,'days').format("YYYY-MM-DD");
    let today = _date.format("YYYY-MM-DD")

    if (srtDt == "" || srtDt == null) {
        srtDt = yester;
        endDt = today;
    }

    let obj = {};
    obj.pageIndex = parseInt(pageIndex);
    obj.rowsPerPage = parseInt(rowsPerPage);
    obj.srchOption = srchOption;
    obj.srchText = srchText;
    obj.srtDt = srtDt;
    obj.endDt = endDt;
    obj.srchMember = srchMember;
    obj.memId = req.user.memId;
    console.log(obj)
    let search = {};    
    search.rowsPerPage = parseInt(rowsPerPage);
    search.srchOption = srchOption;
    search.srchText = srchText;
    search.srtDt = srtDt;
    search.endDt = endDt;
    search.srchMember = srchMember;

    console.log(search)

    try {
        mydb.executeTx(async (conn) => {
            let totalPageCount = await Query.QGetPointCnt(obj, conn);
            let pagination = await pagingUtil.getDynamicPagination(pageIndex, totalPageCount, rowsPerPage)
            let pointList = await Query.QGetPointList(obj, conn);


            let basicInfo = {};
            basicInfo.nav1 = "포인트"
            basicInfo.nav2 = "포인트 사용"
            basicInfo.title = "포인트 사용 내역"
            basicInfo.rtnUrl = "point/point_list";
            basicInfo.pointList = pointList;
            basicInfo.user = req.user;
            basicInfo.pagination = pagination;
            basicInfo.search = search;
            req.basicInfo = basicInfo;
            next();
        });
    } catch (e) {
        logUtil.errObj("mview error", e);
        next(e);
    }
}

