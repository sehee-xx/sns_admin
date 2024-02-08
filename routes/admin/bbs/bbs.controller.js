const path = require('path');
const Mydb = require(path.join(process.cwd(), '/routes/config/mydb'))
const Query = require('./bbs.sqlmap');
const cmmQuery = require(path.join(process.cwd(), '/routes/admin/setting/st.sqlmap'));

const rtnUtil = require(path.join(process.cwd(), '/routes/services/rtnUtil'))
const logUtil = require(path.join(process.cwd(), '/routes/services/logUtil'))
const encUtil = require(path.join(process.cwd(), '/routes/services/encUtil'));
const pagingUtil = require(path.join(process.cwd(), '/routes/services/pagingUtil'))
const commUtil = require(path.join(process.cwd(), '/routes/services/commUtil'));

let isNullOrEmpty = require('is-null-or-empty');

const {v4: uuidv4} = require('uuid');

/*
 * properties
 */
const PropertiesReader = require("properties-reader");
const properties = PropertiesReader("adm.properties");

exports.view = async (req, res, next) => {
    let pool = req.app.get("pool");
    let mydb = new Mydb(pool);
    let {pageIndex, rowsPerPage, srchAuth, srchOption, srchText} = req.body;

    if (pageIndex == "" || pageIndex == null) {
        pageIndex = 1;
    }
    if (rowsPerPage == "" || rowsPerPage == null) {
        rowsPerPage = 10;
    }

    let obj = {};
    obj.pageIndex = parseInt(pageIndex);
    obj.rowsPerPage = parseInt(rowsPerPage);
    obj.srchOption = srchOption;
    obj.srchAuth = srchAuth;
    obj.srchText = srchText;

    console.log(obj)

    let search = {};
    search.rowsPerPage = parseInt(rowsPerPage);
    search.srchOption = srchOption;
    search.srchAuth = srchAuth;
    search.srchText = srchText;

    try {
        mydb.executeTx(async (conn) => {
            let totalPageCount = await Query.QGetBBSCnt(obj, conn);
            let pagination = await pagingUtil.getDynamicPagination(pageIndex, totalPageCount, rowsPerPage)
            let bbs = await Query.QGetBBSList(obj, conn);

           
            let basicInfo = {};
            basicInfo.nav1 = "게시판"
            basicInfo.nav2 = "공지사항"
            basicInfo.title = "공지사항"
            basicInfo.rtnUrl = "admin/bbs/notice";
            basicInfo.user = req.user;
            basicInfo.bbs = bbs;
            
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

exports.modify = async (req, res, next) => {
    let pool = req.app.get("pool");
    let mydb = new Mydb(pool);
    let {seq, content, title, use_yn} = req.body;

    let obj = {};
    obj.seq = seq;
    obj.content = content;
    obj.title = title;
    obj.use_yn = use_yn;
    obj.crt_mem = req.user.id;

    console.log(obj)

    mydb.executeTx(async (conn) => {
        try {
            if(!isNullOrEmpty(seq)) {
                //update
                await Query.QSetBBS(obj, conn)
            } else {
                //create
                await Query.QSetBBS(obj, conn);
                conn.commit;
                return res.json(rtnUtil.successTrue("200", "정상처리 되었습니다.", ));
            }
        } catch (e) {
            conn.rollback()
            logUtil.errObj("mview error", e);
            return res.json(rtnUtil.successTrue("200", "등록에 실패 하였습니다.", ));
        }
    });
   
}