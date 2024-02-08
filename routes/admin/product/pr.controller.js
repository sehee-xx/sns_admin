const path = require('path');
const Mydb = require(path.join(process.cwd(), '/routes/config/mydb'))
const Query = require('./pr.sqlmap');


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
    let {pageIndex, rowsPerPage,  srchOption, srchText, srtDt, endDt} = req.body;

    if (pageIndex == "" || pageIndex == null) {
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
    obj.memId = req.user.memId

    let search = {};
    search.rowsPerPage = parseInt(rowsPerPage);
    search.srchOption = srchOption;
    search.srchText = srchText;
    search.srtDt = srtDt;
    search.endDt = endDt;

    try {
        mydb.executeTx(async (conn) => {
            let totalPageCount = await Query.QGetPannelCnt(req, obj, conn);
            let pagination = await pagingUtil.getDynamicPagination(pageIndex, totalPageCount, rowsPerPage)
            let productList = await Query.QGetPannelList(req, obj, conn);
            let categoryGroup = await Query.QGetPannelGroup( conn);
            

            let basicInfo = {};
            basicInfo.nav1 = "상품 관리"
            basicInfo.nav2 = "상품 관리"
            basicInfo.title = "상품 리스트"
            basicInfo.rtnUrl = "product/product_list";
            basicInfo.productList = productList;
            basicInfo.categoryGroup = categoryGroup;
            
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

exports.sell = async (req, res, next) => {
    let pool = req.app.get("pool");
    let mydb = new Mydb(pool);
    let {pageIndex, rowsPerPage,  srchOption, srchText, srtDt, endDt, seq} = req.body;

    if (pageIndex == "" || pageIndex == null) {
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
    obj.memId = req.user.memId
    obj.seq = seq

    let search = {};
    search.rowsPerPage = parseInt(rowsPerPage);
    search.srchOption = srchOption;
    search.srchText = srchText;
    search.srtDt = srtDt;
    search.endDt = endDt;

    try {
        mydb.executeTx(async (conn) => {
            let totalPageCount = await Query.QGetSellProductCnt(obj, conn);
            let pagination = await pagingUtil.getDynamicPagination(pageIndex, totalPageCount, rowsPerPage)
            let productList = await Query.QGetSellProductList(obj, conn);


            let basicInfo = {};
            basicInfo.nav1 = "상품 관리"
            basicInfo.nav2 = "상품 관리"
            basicInfo.title = "판매 상품 리스트"
            basicInfo.rtnUrl = "product/sell_list";
            basicInfo.productList = productList;
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

exports.category = async (req, res, next) => {
    let pool = req.app.get("pool");
    let mydb = new Mydb(pool);
    let {pageIndex, rowsPerPage,  srchOption, srchText, srtDt, endDt, seq} = req.body;

    if (pageIndex == "" || pageIndex == null) {
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
    obj.memId = req.user.memId
    obj.seq = seq

    let search = {};
    search.rowsPerPage = parseInt(rowsPerPage);
    search.srchOption = srchOption;
    search.srchText = srchText;
    search.srtDt = srtDt;
    search.endDt = endDt;

    try {
        mydb.executeTx(async (conn) => {
            let totalPageCount = await Query.QGetCategoryCnt(obj, conn);
            let pagination = await pagingUtil.getDynamicPagination(pageIndex, totalPageCount, rowsPerPage)
            let caList = await Query.QGetCategoryList(obj, conn);


            let basicInfo = {};
            basicInfo.nav1 = "상품 관리"
            basicInfo.nav2 = "상품 관리"
            basicInfo.title = "카테고리 리스트"
            basicInfo.rtnUrl = "product/category";
            basicInfo.caList = caList;
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

exports.product_add = async (req, res, next) => {
    let {piSeq, pTitle, viewYN,pPrice,pMin,pMax,categorySeq } = req.body;
    let pool = req.app.get("pool");
    let mydb = new Mydb(pool);
   
    try {
        mydb.executeTx(async (conn) => {
            let obj = {};
            obj.piSeq = piSeq;
            obj.pTitle = pTitle;
            obj.viewYN = viewYN;
            obj.pPrice = pPrice;
            obj.pMin = pMin;
            obj.pMax = pMax;
            obj.categorySeq = categorySeq;

            await Query.QSetSellProduct(obj, conn);

            conn.commit();
            return res.json(rtnUtil.successTrue("200", "판매 상품 등록 되었습니다.", ""));
        });
    } catch (e) {
        logUtil.errObj("mview error", e);
        return res.json(rtnUtil.successFalse("500", "접속량이 많아 연결이 지연되고있습니다. 잠시후 다시 시도해주세요.", ""));
    }

}

exports.categoryAdd = async (req, res, next) => {
    let {pTitle, viewYN} = req.body;
    let pool = req.app.get("pool");
    let mydb = new Mydb(pool);
   
    try {
        mydb.executeTx(async (conn) => {
            let obj = {};
            obj.pTitle = pTitle;
            obj.viewYN = viewYN;

            await Query.QSetCategory(obj, conn);

            conn.commit();
            return res.json(rtnUtil.successTrue("200", "카테고리 등록 되었습니다.", ""));
        });
    } catch (e) {
        logUtil.errObj("mview error", e);
        return res.json(rtnUtil.successFalse("500", "접속량이 많아 연결이 지연되고있습니다. 잠시후 다시 시도해주세요.", ""));
    }

}