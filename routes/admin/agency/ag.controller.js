const path = require('path');
const Mydb = require(path.join(process.cwd(), '/routes/config/mydb'))
const Query = require('./ag.sqlmap');

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
    let {pageIndex, rowsPerPage, srchOption, srchText,srtDt, endDt} = req.body;

    if (pageIndex == "" || pageIndex == null) {
        pageIndex = 1;
    }
    if (rowsPerPage == "" || rowsPerPage == null) {
        rowsPerPage = 10;
    }

    let _date = moment(new Date());
    let yester = moment(new Date()).subtract(1,'month').format("YYYY-MM-DD");
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
            //obj.seq = 'AGNT00000000000001';
            let upperList = await Query.QGetAgentUpperList(obj, conn);

            let productList = await Query.QGetAgentProductMatchList(obj, conn);

            let basicInfo = {};
            basicInfo.nav1 = "영업"
            basicInfo.nav2 = "에이전트"
            basicInfo.title = "에이전트 리스트"
            basicInfo.rtnUrl = "agent/agent_list";
            basicInfo.user = req.user;
            basicInfo.agentList = agentList;
            basicInfo.upperList = upperList;
            basicInfo.productList = productList;
            
            basicInfo.pagination = pagination;
            basicInfo.search = search;

            req.basicInfo = basicInfo;
            next();
        });
    } catch (e) {
        logUtil.errObj("agent view error", e);
        next(e);
    }
}

exports.getAgent = async (req, res, next) => {
    let pool = req.app.get("pool");
    let mydb = new Mydb(pool);
    let {upperSeq} = req.body;

    let obj = {};
    obj.seq = upperSeq;
    if(isNullOrEmpty())     obj.memId = req.user.memId;

    mydb.execute(async (conn) => {

        try {
            let upperList = await Query.QGetAgentUpperList(obj, conn);
            if(upperList.length > 0){
                return res.json(rtnUtil.successTrue("200", "정상처리 되었습니다.", upperList));
            }else{
                return res.json(rtnUtil.successFalse("-1", "존재하지 에이전트 입니다."));
            }
        }catch (e) {
            logUtil.errObj("getAgent error", e);
            return res.json(rtnUtil.successFalse("500", "접속량이 많아 연결이 지연되고있습니다. 잠시후 다시 시도해주세요.", ""));
        }
    });

}

exports.getDepthAgent = async (req, res, next) => {
    let pool = req.app.get("pool");
    let mydb = new Mydb(pool);
    let {aDepth} = req.body;

    let obj = {};


    mydb.execute(async (conn) => {

        try {
            obj.memId = req.user.memId;
            obj.aDepth = Number(aDepth)-1;
            let upperList = await Query.QGetAgentDetphList(obj, conn);
            obj.aDepth = Number(aDepth)+1;
            let subList = await Query.QGetAgentDetphList(obj, conn);

            let depthList = {};
            depthList.upperList = upperList;
            depthList.subList = subList;

            return res.json(rtnUtil.successTrue("200", "정상처리 되었습니다.", depthList));
        }catch (e) {
            logUtil.errObj("getAgent error", e);
            return res.json(rtnUtil.successFalse("500", "접속량이 많아 연결이 지연되고있습니다. 잠시후 다시 시도해주세요.", ""));
        }
    });

}

exports.setAgent = async (req, res, next) => {
    let pool = req.app.get("pool");
    let mydb = new Mydb(pool);
    let {agentCode, aId, aNm,memId,rate} = req.body;
    console.log(agentCode)
    let upperSeq = agentCode;
    let upperSeqArr = agentCode.split(",");

    // 중복된 값 제거
    let uniqueArray = Array.from(new Set(upperSeqArr));

    // 빈 문자열 제거
    let resultArray = uniqueArray.filter(value => value !== '');

    if (resultArray.length > 0 ) upperSeq = resultArray[resultArray.length - 1];

        let obj = {};
        obj.upperSeq = upperSeq;
        obj.aId = aId;
        obj.aNm = aNm;
        obj.memId = memId;
        obj.rate = rate;
        console.log(obj)
        mydb.executeTx(async (conn) => {

        try {
            let mList = await Query.QGetMember(memId, conn); 
            if (mList.length > 0) {
                let upperList = await Query.QSetAgentUpper(obj, conn);
                conn.commit();
                return res.json(rtnUtil.successTrue("200", "정상처리 되었습니다.", upperList));
            } else {
                return res.json(rtnUtil.successFalse("500", "존재하지 않는 에이전시입니다. ", ""));
            }
        }catch (e) {
            conn.rollback();
            logUtil.errObj("setAgent error", e);
            return res.json(rtnUtil.successFalse("500", "접속량이 많아 연결이 지연되고있습니다. 잠시후 다시 시도해주세요.", ""));
        }
    });

}

exports.delAgent = async (req, res, next) => {
    let pool = req.app.get("pool");
    let mydb = new Mydb(pool);
    let {seq} = req.body;

    let obj = {};

    obj.seq = seq;

    mydb.executeTx(async (conn) => {

        try {

            let agentInfo = await Query.QGetAgentInfo(obj, conn);
            if (agentInfo.length > 0) {
                obj.upperSeq = agentInfo[0].upper_seq;
                obj.aDepth = agentInfo[0].a_depth;
                console.log(obj)
                await Query.QDelUptAgent(obj, conn);
                obj.useyn = 'N';
                await Query.QUptUseYNAgent(obj, conn);

                conn.commit();

                return res.json(rtnUtil.successTrue("200", "정상처리 되었습니다.", ""));

            } else {
                return res.json(rtnUtil.successFalse("500", "에이전트가 존재 하지 않습니다.", ""));
            }


        }catch (e) {
            conn.rollback();
            logUtil.errObj("setAgent error", e);
            return res.json(rtnUtil.successFalse("500", "접속량이 많아 연결이 지연되고있습니다. 잠시후 다시 시도해주세요.", ""));
        }
    });

}


exports.uptModyAgent = async (req, res, next) => {
    let pool = req.app.get("pool");
    let mydb = new Mydb(pool);
    let {seq,aId, aNm,memId,rate,upperAgent,modPassword} = req.body;

    let obj = {};
    obj.seq = seq;
    
    obj.aId = aId;
    obj.aNm = aNm;
    obj.memId = memId;
    obj.rate = rate;
    obj.upperSeq = upperAgent;
    obj.modPassword = modPassword

    console.log(obj)
    mydb.execute(async (conn) => {

        try {
            let agentInfo = await Query.QGetAgentInfo(obj, conn);
            if(agentInfo.length > 0){
                if (!isNullOrEmpty(modPassword)) {
                    let memInfo = await Query.QGetMemInfoById(obj, conn);
                    if(memInfo.length == 0){
                        return res.json(rtnUtil.successFalse("-1", "존재하지 않는 에이전트 입니다."));
                    }else{
                        // 초기화 비밀번호 
                        obj.crtMem = memId; // req.user.memId
                        let passInfo = await encUtil.createPasswordHash(modPassword);
                        obj.memPw = passInfo.password;
                        obj.memSalt = passInfo.salt;
                        await Query.QUptMemInfo(obj, conn);
                        conn.commit();
                    }
                }

                await Query.QModyUptAgent(obj, conn);

                return res.json(rtnUtil.successTrue("200", "정상처리 되었습니다.", ""));
            }else{
                return res.json(rtnUtil.successFalse("-1", "존재하지 에이전트 입니다."));
            }
        }catch (e) {
            logUtil.errObj("uptModyAgent error", e);
            return res.json(rtnUtil.successFalse("500", "접속량이 많아 연결이 지연되고있습니다. 잠시후 다시 시도해주세요.", ""));
        }
    });

}

  exports.bonus = async (req, res, next) => {
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
            let totalPageCount = await Query.QGetBonusCnt(obj, conn);
            let pagination = await pagingUtil.getDynamicPagination(pageIndex, totalPageCount, rowsPerPage)
            let bounsList = await Query.QGetBonusList(obj, conn);


            let basicInfo = {};
            basicInfo.nav1 = "영업"
            basicInfo.nav2 = "에이전트"
            basicInfo.title = "수당지급 리스트"
            basicInfo.rtnUrl = "agent/bonus_list";
            basicInfo.user = req.user;
            basicInfo.bounsList = bounsList;
            basicInfo.pagination = pagination;
            basicInfo.search = search;

            req.basicInfo = basicInfo;
            next();
        });
    } catch (e) {
        logUtil.errObj("agent view error", e);
        next(e);
    }
}

exports.setAP = async (req, res, next) => {
    let pool = req.app.get("pool");
    let mydb = new Mydb(pool);
    let {agentId,productSeq} = req.body;

    let obj = {};
    obj.agentId = agentId;
    obj.productSeq = productSeq;
    obj.memId = req.user.memId;

    mydb.execute(async (conn) => {

        try {
            await Query.QSetAgentProduct(obj, conn);
            conn.commit();
            return res.json(rtnUtil.successTrue("200", "정상처리 되었습니다.", ""));
        }catch (e) {
            logUtil.errObj("uptModyAgent error", e);
            return res.json(rtnUtil.successFalse("500", "접속량이 많아 연결이 지연되고있습니다. 잠시후 다시 시도해주세요.", ""));
        }
    });

}

exports.getAPList = async (req, res, next) => {
    let pool = req.app.get("pool");
    let mydb = new Mydb(pool);
    let {agentId} = req.body;

    let obj = {};
    obj.agentId = agentId;
    obj.memId = req.user.memId;

    mydb.execute(async (conn) => {

        try {
            let apList = await Query.QGetAgentProductList(obj, conn);

            return res.json(rtnUtil.successTrue("200", "정상처리 되었습니다.", apList));
        }catch (e) {
            logUtil.errObj("uptModyAgent error", e);
            return res.json(rtnUtil.successFalse("500", "접속량이 많아 연결이 지연되고있습니다. 잠시후 다시 시도해주세요.", ""));
        }
    });

}

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
            let upt = await Query.QProductAgentYn(obj, conn);
            return res.json(rtnUtil.successTrue("200", "정상처리 되었습니다.", ));

        });
	} catch (e) {
		logUtil.errObj("adminProc 2 error", e);
		res.json(rtnUtil.successFalse("500", "", "접속량이 많아 연결이 지연되고있습니다. 잠시후 다시 시도해주세요!"));
	}
};