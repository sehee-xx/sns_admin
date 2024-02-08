let isNullOrEmpty = require('is-null-or-empty');

function fnGetBBSCnt(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = ` select count(1) as cnt from tb_bbs where 1=1 `
        sql += " union all select 0 as cnt from dual limit 1"
        console.log('fnGetBBSCnt :>> ', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(ret[0].cnt);
        });
    });
}

function fnGetBBSList(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = ` SELECT seq, title, writer, content, category, view_cnt, DATE_FORMAT(crt_dt, '%Y-%m-%d %H:%i') crt_dt, upt_dt, use_yn FROM tb_bbs where use_yn = 'Y'
        
         `
         sql += " order by crt_dt desc "
         sql += " limit " + (param.pageIndex - 1) * param.rowsPerPage + "," + param.rowsPerPage
        console.log('fnGetBBSList :>> ', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(ret);
        });
    });
}

function fnSetBBS(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = ` INSERT INTO tb_bbs
        (title, writer, content, category, view_cnt, crt_dt, upt_dt, use_yn)
        VALUES('${param.title}', '${param.crt_mem}', '${param.content}', 0, 0, CURRENT_TIMESTAMP, '', '${param.use_yn}') `
        
        console.log('fnSetBBS :>> ', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(ret);
        });
    });
}

module.exports.QGetBBSCnt = fnGetBBSCnt 
module.exports.QGetBBSList = fnGetBBSList 
module.exports.QSetBBS = fnSetBBS 
