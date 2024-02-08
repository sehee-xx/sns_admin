let isNullOrEmpty = require('is-null-or-empty');

function fnGetAgentCnt(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = ` select count(1) as cnt from tb_agent tg where 1=1 
        and FIND_IN_SET(a_id, fn_get_mem_list('${param.memId}')) > 0 
        and use_yn ='Y'  `

        if (param.srchOption == "1") {
            sql += " and mem_id like '%"+param.srchText+"%' "
        }else if (param.srchOption == "2") { //그룹명
            sql += " and a_id like '%"+param.srchText+"%'  "
        }

        console.log('fnGetAgentCnt :>> ', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(ret[0].cnt);
        });
    });
}

function fnGetAgentList(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = ` SELECT seq, a_id, a_nm, (select a_nm from tb_agent ta1 where ta1.seq = ta.upper_seq) upper_seq_nm, upper_seq, a_rate, mem_id, a_depth, use_yn, DATE_FORMAT(crt_dt, '%Y-%m-%d %H:%i') crt_dt
        FROM tb_agent ta
            where 1=1 and use_yn ='Y' and FIND_IN_SET(a_id, fn_get_mem_list('${param.memId}')) > 0  and use_yn = 'Y' `
            if (param.srchOption == "1") {
                sql += " and mem_id like '%"+param.srchText+"%' "
            }else if (param.srchOption == "2") { //그룹명
                sql += " and a_id like '%"+param.srchText+"%'  "
            }
            sql += " order by crt_dt desc "
            sql += " limit " + (param.pageIndex - 1) * param.rowsPerPage + "," + param.rowsPerPage

        console.log('fnGetAgentList :>> ', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(ret);
        });
    });
}

function fnGetAgentProductMatchList(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = ` SELECT ta.*, tc.krw, tc.usd
        FROM tb_product_info  ta inner join tb_product_cd tc on tc.product_cd = ta.product_cd
            where 1=1 and ta.use_yn ='Y' and FIND_IN_SET(ta.crt_mn, fn_get_mem_list('${param.memId}')) > 0  `
          
        console.log('fnGetAgentList :>> ', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(ret);
        });
    });
}

function fnGetAgentUpperList(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = ` SELECT seq, a_id, a_nm, upper_seq, a_rate, mem_id, use_yn, a_depth
        FROM tb_agent
            where 1=1 and use_yn ='Y' 
            `
            if (!isNullOrEmpty(param.memId)) {
                sql += ` and FIND_IN_SET(a_id, fn_get_mem_list('${param.memId}')) > 0   `
            }

            if (!isNullOrEmpty(param.seq)) {
                sql += " and upper_seq = '"+param.seq+"'  "
            }
           
            sql += " order by crt_dt desc "

        console.log('fnGetAgentUpperList :>> ', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(ret);
        });
    });
}

function fnGetAgentDetphList(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = ` SELECT seq, a_id, a_nm, upper_seq, a_rate, mem_id, use_yn, a_depth
        FROM tb_agent
        where 1=1 and use_yn ='Y' and FIND_IN_SET(a_id, fn_get_mem_list('${param.memId}')) > 0 and a_depth = ${param.aDepth} `

        console.log('fnGetAgentDetphList :>> ', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(ret);
        });
    });
}



function fnGetAgentInfo(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = ` SELECT seq, a_id, a_nm, upper_seq, a_rate, mem_id, a_depth, use_yn
        FROM tb_agent where 1=1  `
        if (!isNullOrEmpty(param.memId)) {
            sql += ` and use_yn ='Y' and FIND_IN_SET(a_id, fn_get_mem_list('${param.memId}')) > 0  `
        }
           
            sql += " and seq = '"+param.seq+"'  "

        console.log('fnGetAgentInfo :>> ', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(ret);
        });
    });
}


function fnSetAgentUpper(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = ` 
        DROP TEMPORARY TABLE IF EXISTS temp_ag_table;
        CREATE TEMPORARY TABLE temp_ag_table AS
            SELECT a_depth + 1 AS new_depth
            FROM tb_agent
            WHERE seq = '${param.upperSeq}';

        -- Use the temporary table in the INSERT statement
        INSERT INTO tb_agent (seq, a_id, a_nm, upper_seq, a_rate, mem_id, a_depth, use_yn, crt_dt)
        SELECT
            fn_gen_key('tb_agent'),
            '${param.aId}',
            '${param.aNm}',
            '${param.upperSeq}',
            ${param.rate},
            '${param.memId}',
            new_depth,
            'Y',
            CURRENT_TIMESTAMP
        FROM temp_ag_table;

        -- Drop the temporary table
        DROP TEMPORARY TABLE IF EXISTS temp_ag_table;`

        console.log('fnSetAgentUpper :>> ', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(ret);
        });
    });
}


function fnDelUptAgent(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = ` UPDATE tb_agent ta SET upper_seq = '${param.upperSeq}'  WHERE seq = '${param.seq}' `

        console.log('fnDelUptAgent :>> ', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(ret);
        });
    });
}

function fnUptUseYNAgent(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = ` UPDATE tb_agent ta SET use_yn = '${param.useyn}' WHERE seq = '${param.seq}' `

        console.log('fnUptUseYNAgent :>> ', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(ret);
        });
    });
}

function fnModyUptAgent(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = `
        UPDATE tb_agent
        SET a_nm='${param.aNm}', upper_seq='${param.upperSeq}', a_rate=${param.rate}, mem_id='${param.memId}', crt_dt=CURRENT_TIMESTAMP
        where 1=1 `
        sql += " and seq = '"+param.seq+"'  "

        console.log('fnModyUptAgent :>> ', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(ret);
        });
    });
}

function fnGetMember(memId, conn) {
    return new Promise(function (resolve, reject) {
        let sql = `
        SELECT mem_id, mem_nm, lpassword, lsalt, mem_hp, mem_email, mem_agent, recmmndr_id, 
        user_status, admin_yn, crt_dt, crt_mem, upt_dt
          FROM tb_membership where mem_id = '${memId}' 
`

        console.log('fnGetMember :>> ', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(ret);
        });
    });
}

function fnGetBonusCnt(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = `
        select count(*) as cnt  
            FROM tb_agent_bonus t where 1=1
`

        if (param.srchOption == "1") {
            sql += " and t.mem_agent like '%"+param.srchText+"%' "
        }
        console.log('fnGetBonusCnt :>> ', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(ret[0].cnt);
        });
    });
}

function fnGetBonusList(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = `
        SELECT seq, t.mem_id, t.mem_agent, a_rate, cf_unit, refer_seq, 
        DATE_FORMAT(t.crt_dt, '%Y-%m-%d %H:%i:%s') crt_dt , p_bonus , a_depth
        FROM tb_agent_bonus t where 1=1 and FIND_IN_SET(mem_id, fn_get_mem_list('${param.memId}')) > 0  `

        if (param.srchOption == "1") {
            sql += " and t.mem_agent like '%"+param.srchText+"%' "
        }
        sql += " order by t.crt_dt desc "
        sql += " limit " + (param.pageIndex - 1) * param.rowsPerPage + "," + param.rowsPerPage
        console.log('fnGetBonusList :>> ', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(ret);
        });
    });
}

function fnSetAgentProduct(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = `
        INSERT INTO tb_agent_product_match
        (agent_id, product_seq, use_yn, crt_dt, crt_nm)
        VALUES('${param.agentId}', ${param.productSeq}, 'Y', CURRENT_TIMESTAMP, '${param.memId}'); `

      
        console.log('fnSetAgentProduct :>> ', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(ret);
        });
    });
}


function fnGetAgentProductList(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = `
        select tapm.seq, tapm.agent_id, pdi.title , tpc.category , tpc.product_cd ,tpc.product_nm, tpc.krw, tpc.usd
        from tb_agent_product_match tapm 
        inner join tb_product_info pdi on tapm.product_seq = pdi.seq and pdi.use_yn ='Y'
        inner join tb_product_cd tpc on tpc.product_cd  = pdi.product_cd and tpc.use_yn = 'Y'
        where tapm.agent_id = '${param.agentId}' and tapm.use_yn = 'Y'; `

      
        console.log('fnGetAgentProductList :>> ', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(ret);
        });
    });
}

function fnGetMemInfoById(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = " SELECT "
            sql +=      " tm.mem_id , "
            sql +=      " tm.mem_nm , "
            sql +=      " tm.lpassword , "
            sql +=      " tm.lsalt , "
            sql +=      " tm.mem_hp , "
            sql +=      " tm.mem_email , "
            sql +=      " tm.mem_agent , "
            sql +=      " tm.user_status , "
            sql +=      " fn_get_name(tm.user_status) user_status_nm , "
            sql +=      " tm.admin_yn ,"
            sql +=      " tm.crt_dt   " 
            sql += " FROM tb_membership tm "
            sql += " where 1=1 "
            
            if (!isNullOrEmpty(param.aId)) {
                sql += " and tm.mem_id = '"+param.aId+"' "
            }
           
        // console.log('fnGetMemInfoById :>> ', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                logUtil.logMsg("", "Query-fnGetMemInfoById - 회원조회 " , sql)
                reject(err)
            }
            resolve(ret);
        });
    });
}

function fnUptMemInfo(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql =` UPDATE  tb_membership set lpassword = '${param.memPw}', lsalt = '${param.memSalt}' where mem_id = '${param.aId}'  `

        console.log("", "Query-fnUptMemInfo - 회원가입 " , sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                
                reject(err);
            }
            resolve(ret);
        });
    });
}

function fnProductAgentYn(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql =` 
        UPDATE tb_agent_product_match
        SET product_yn= ${param.pViewYn}
        WHERE seq='${param.pSeq}';
        `
           
        logUtil.logMsg("", "Query-fnProductAgentYn - 상품 전시 여부 " , sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}

module.exports.QGetAgentCnt = fnGetAgentCnt;
module.exports.QGetAgentList = fnGetAgentList;

module.exports.QGetAgentUpperList = fnGetAgentUpperList;

module.exports.QSetAgentUpper = fnSetAgentUpper;

module.exports.QGetAgentDetphList = fnGetAgentDetphList;

module.exports.QGetAgentInfo = fnGetAgentInfo;
module.exports.QDelUptAgent = fnDelUptAgent;
module.exports.QUptUseYNAgent = fnUptUseYNAgent;
module.exports.QModyUptAgent = fnModyUptAgent;

module.exports.QGetMember = fnGetMember;


module.exports.QGetBonusCnt = fnGetBonusCnt;
module.exports.QGetBonusList = fnGetBonusList;

module.exports.QGetAgentProductMatchList = fnGetAgentProductMatchList;
module.exports.QSetAgentProduct = fnSetAgentProduct;
module.exports.QGetAgentProductList = fnGetAgentProductList;

module.exports.QGetMemInfoById = fnGetMemInfoById;
module.exports.QUptMemInfo = fnUptMemInfo;

module.exports.QProductAgentYn = fnProductAgentYn;
