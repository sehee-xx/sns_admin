let isNullOrEmpty = require('is-null-or-empty');
const path = require('path');
const logUtil = require(path.join(process.cwd(), '/routes/services/logUtil'))

function fnGetPointCnt(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = ` select count(1) as cnt from tb_use_point_dtl where 1 =1   `
           
        if (param.srchOption == "1") {
            sql += " and mem_id like '%"+param.srchText+"%' "
        }
   
        console.log('fnGetPointCnt :>> ', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(ret[0].cnt);
        });
    });
}

function fnGetPointList(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = ` 
    SELECT
        upt.seq,
        upt.mem_id,
        fn_get_name(upt.b_type) AS b_type_name,
        upt.b_type,
        fn_get_name(upt.b_increase) AS b_increase_name,
        upt.b_increase,
        bonus.memo,
        upt.b_point,
        upt.b_desc,
        DATE_FORMAT(upt.crt_dt, '%Y-%m-%d %H:%i') AS crt_dt,
        upt.crt_mem
    FROM
        tb_use_point_dtl upt
    INNER JOIN (
        SELECT
            tab.seq,
            GROUP_CONCAT(
                CONCAT(
                    mem_agent, ' : ', a_rate, '% 비율로 ', p_bonus, ' 지급'
                )
                ORDER BY seq ASC
                SEPARATOR ' / '
            ) AS memo
        FROM
            tb_agent_bonus tab
        GROUP BY
            refer_seq
    ) bonus ON upt.seq = bonus.seq
            where 1=1  and FIND_IN_SET(mem_id, fn_get_mem_list('${param.memId}')) > 0  `
            if (param.srchOption == "1") {
                sql += " and mem_id like '%"+param.srchText+"%' "
            }

            if (!isNullOrEmpty(param.srtDt)) {
                sql += ` and DATE_FORMAT(crt_dt, '%Y-%m-%d') >= '${param.srtDt}' `
            }
            if (!isNullOrEmpty(param.endDt)) {
                sql += `  and DATE_FORMAT(crt_dt, '%Y-%m-%d') <= '${param.endDt}' `
            }
   

            sql += " order by crt_dt desc "
            sql += " limit " + (param.pageIndex - 1) * param.rowsPerPage + "," + param.rowsPerPage
   
            logUtil.logMsg("", "Query-fnGetPointList - 포인트 변동 내역 " , sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(ret);
        });
    });
}

module.exports.QGetPointCnt = fnGetPointCnt;
module.exports.QGetPointList = fnGetPointList;

