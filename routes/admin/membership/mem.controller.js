const path = require('path');
const Mydb = require(path.join(process.cwd(), '/routes/config/mydb'))
const Query = require('./mem.sqlmap');
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
    let {pageIndex, rowsPerPage, srchOption, srchText, srchMember, srtDt, endDt} = req.body;

    if (isNullOrEmpty(pageIndex)) {
        pageIndex = 1;
    }
    if (isNullOrEmpty(rowsPerPage)) {
        rowsPerPage = 10;
    }

    let _date = moment(new Date());
    let yester = moment(new Date()).subtract(30,'days').format("YYYY-MM-DD");
    let today = _date.format("YYYY-MM-DD")

    if (isNullOrEmpty(srtDt)) {
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

    logUtil.logMsg(req, "controller-view - 회원조회 " , obj)

    let search = {};
    search.rowsPerPage = parseInt(rowsPerPage);
    search.srchOption = srchOption;
    search.srchText = srchText;
    search.srtDt = srtDt;
    search.endDt = endDt;
    search.srchMember = srchMember;

    try {
        mydb.executeTx(async (conn) => {
            console.log(obj)
            let totalPageCount = await Query.QGetMemCnt(obj, conn);
            let pagination = await pagingUtil.getDynamicPagination(pageIndex, totalPageCount, rowsPerPage)
            let memList = await Query.QGetMemList(obj, conn);

            let basicInfo = {};
            basicInfo.nav1 = "회원관리"
            basicInfo.nav2 = "회원리스트"
            basicInfo.title = "회원리스트"
            basicInfo.rtnUrl = "membership/mem_list";
            basicInfo.user = req.user;
            basicInfo.memList = memList
            
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

exports.agent = async (req, res, next) => {
    let pool = req.app.get("pool");
    let mydb = new Mydb(pool);
    let {pageIndex, rowsPerPage, srchOption, srchText,srtDt, endDt} = req.body;

    if (pageIndex == "" || pageIndex == null) {
        pageIndex = 1;
    }
    if (rowsPerPage == "" || rowsPerPage == null) {
        rowsPerPage = 10;
    }

    let _date = moment(new Date());
    let yester = moment(new Date()).subtract(1,'days').format("YYYY-MM-DD");
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
    obj.memId = req.user.memId;
  

    let search = {};
    search.rowsPerPage = parseInt(rowsPerPage);
    search.srchOption = srchOption;
    search.srchText = srchText;
    search.srtDt = srtDt;
    search.endDt = endDt;


    try {
        mydb.executeTx(async (conn) => {
            let totalPageCount = await Query.QGetAgentCnt(obj, conn);
            let pagination = await pagingUtil.getDynamicPagination(pageIndex, totalPageCount, rowsPerPage)
            let agentList = await Query.QGetAgentList(obj, conn);

            let basicInfo = {};
            basicInfo.nav1 = "회원관리"
            basicInfo.nav2 = "에이전트"
            basicInfo.title = "에이전트 리스트"
            basicInfo.rtnUrl = "membership/agentList";
            basicInfo.user = req.user;
            basicInfo.agentList = agentList;
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


exports.signupProc = async (req, res, next) => {
	const { memId, passwd, memAgent } = req.body;

	let obj = {
		memId: memId,
        memAgent : memAgent,
	};

    let pool = req.app.get("pool");
    let mydb = new Mydb(pool);

	try {
		mydb.executeTx(async (conn) => {
            let memInfo = await Query.QGetMemInfoById(obj, conn);
            try {
                if(memInfo.length > 0){
                    return res.json(rtnUtil.successFalse("-1", "사용중인 아이디 입니다."));
                }else{
                    // 초기화 비밀번호 
                    obj.crtMem = req.user.memId; // req.user.memId
                    let passInfo = await encUtil.createPasswordHash(passwd);
                    obj.memPw = passInfo.password;
                    obj.memSalt = passInfo.salt;
                    logUtil.logMsg(req, "signupProc - 회원가입 " , obj)
                    let ins = await Query.QSetMemInfo(obj, conn);
                    // 은행정보 입력
                   
                    conn.commit();
                    
                    return res.json(rtnUtil.successTrue("200", "정상처리 되었습니다.", ));
                }
            }catch (e) {
                conn.rollback();
                logUtil.errObj("signUpProc error", e);
                return res.json(rtnUtil.successFalse("500", "접속량이 많아 연결이 지연되고있습니다. 잠시후 다시 시도해주세요.", ""));
            }

        });
	} catch (e) {
		logUtil.errObj("signupProc error", e);
		res.json(rtnUtil.successFalse("500", "", "접속량이 많아 연결이 지연되고있습니다. 잠시후 다시 시도해주세요!"));
	}
};


exports.adminProc = async (req, res, next) => {
	const { memId, adminYN } = req.body;

    
	let obj = {
		memId: memId,
		adminYN: adminYN
	};

    

    let pool = req.app.get("pool");
    let mydb = new Mydb(pool);

	try {
		mydb.executeTx(async (conn) => {
            let memInfo = await Query.QGetMemInfoById(obj, conn);
            try {
                if(memInfo.length > 0){
                    
                    let upt = await Query.QUptAdminMemInfo(obj, conn);
                    return res.json(rtnUtil.successTrue("200", "정상처리 되었습니다.", ));
                    
                }else{
                    return res.json(rtnUtil.successFalse("-1", "존재하지 않는 아이디 입니다."));
                }
            }catch (e) {
                conn.rollback();
                logUtil.errObj("adminProc error", e);
                return res.json(rtnUtil.successFalse("500", "접속량이 많아 연결이 지연되고있습니다. 잠시후 다시 시도해주세요.", ""));
            }

        });
	} catch (e) {
		logUtil.errObj("adminProc 2 error", e);
		res.json(rtnUtil.successFalse("500", "", "접속량이 많아 연결이 지연되고있습니다. 잠시후 다시 시도해주세요!"));
	}
};

exports.adminModify = async (req, res, next) => {
	let {aPassword} = req.body;
    let pool = req.app.get("pool");
    let mydb = new Mydb(pool);
    mydb.execute(async (conn) => {
     // 초기화 비밀번호 
     try {
      let obj = {}
      
      obj.memId = req.user.memId; // req.user.memId
      let passInfo = await encUtil.createPasswordHash(aPassword);
      obj.memPw = passInfo.password;
      obj.memSalt = passInfo.salt;
      await Query.QUptMemPassword(obj, conn);
      conn.commit();

      return res.json(rtnUtil.successTrue("200", "정상처리 되었습니다.", ""));
     } catch (error) {
      console.log(error)
      res.json(rtnUtil.successFalse("500", "", "접속량이 많아 연결이 지연되고있습니다. 잠시후 다시 시도해주세요!"));
     }
      
    })
};


exports.memStopProc = async (req, res, next) => {
	const { memId, stopYn } = req.body;

    
	let obj = {
		memId: memId,
		stopYn: stopYn
	};

    let pool = req.app.get("pool");
    let mydb = new Mydb(pool);

	try {
		mydb.executeTx(async (conn) => {
            let memInfo = await Query.QGetMemInfoById(obj, conn);
            try {
                if(memInfo.length > 0){
                    
                    let upt = await Query.QUptMemYN(obj, conn);
                    return res.json(rtnUtil.successTrue("200", "정상처리 되었습니다.", ));
                    
                }else{
                    return res.json(rtnUtil.successFalse("-1", "존재하지 않는 아이디 입니다."));
                }
            }catch (e) {
                conn.rollback();
                logUtil.errObj("adminProc error", e);
                return res.json(rtnUtil.successFalse("500", "접속량이 많아 연결이 지연되고있습니다. 잠시후 다시 시도해주세요.", ""));
            }

        });
	} catch (e) {
		logUtil.errObj("adminProc 2 error", e);
		res.json(rtnUtil.successFalse("500", "", "접속량이 많아 연결이 지연되고있습니다. 잠시후 다시 시도해주세요!"));
	}
};

exports.productView = async (req, res, next) => {
	const { pSeq, pViewYn } = req.body;

    
	let obj = {
		pSeq: pSeq,
		pViewYn: pViewYn
	};

    let pool = req.app.get("pool");
    let mydb = new Mydb(pool);

	try {
		mydb.executeTx(async (conn) => {
            let upt = await Query.QProductMemYn(obj, conn);
            return res.json(rtnUtil.successTrue("200", "정상처리 되었습니다.", ));

        });
	} catch (e) {
		logUtil.errObj("adminProc 2 error", e);
		res.json(rtnUtil.successFalse("500", "", "접속량이 많아 연결이 지연되고있습니다. 잠시후 다시 시도해주세요!"));
	}
};

exports.setMA = async (req, res, next) => {
    let pool = req.app.get("pool");
    let mydb = new Mydb(pool);
    let {pMemId,apSeq} = req.body;

    let obj = {};
    obj.pMemId = pMemId;
    obj.apSeq = apSeq;
    obj.memId = req.user.memId;

    mydb.execute(async (conn) => {

        try {
            await Query.QSetMemberAgentProduct(obj, conn);
            conn.commit();
            return res.json(rtnUtil.successTrue("200", "정상처리 되었습니다.", ""));
        }catch (e) {
            logUtil.errObj("uptModyAgent error", e);
            return res.json(rtnUtil.successFalse("500", "접속량이 많아 연결이 지연되고있습니다. 잠시후 다시 시도해주세요.", ""));
        }
    });

}

exports.getMAPList = async (req, res, next) => {
    let pool = req.app.get("pool");
    let mydb = new Mydb(pool);
    let {pMemId} = req.body;

    let obj = {};
    obj.pMemId = pMemId;
    obj.memId = req.user.memId;

    mydb.execute(async (conn) => {

        try {
            let mapList = await Query.QGetMemberAgentProductList(obj, conn);

            return res.json(rtnUtil.successTrue("200", "정상처리 되었습니다.", mapList));
        }catch (e) {
            logUtil.errObj("uptModyAgent error", e);
            return res.json(rtnUtil.successFalse("500", "접속량이 많아 연결이 지연되고있습니다. 잠시후 다시 시도해주세요.", ""));
        }
    });

}

