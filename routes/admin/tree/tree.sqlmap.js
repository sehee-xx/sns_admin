let isNullOrEmpty = require('is-null-or-empty');

function fnGetRcmmndrList(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = `
        WITH RECURSIVE t3 (seq, a_id,a_nm ,unit,upper_seq,a_rate) AS

        (

            SELECT t1.seq, t1.a_id, t1.a_nm ,1 AS unit, t1.upper_seq,t1.a_rate
            FROM tb_agent t1
            WHERE t1.upper_seq  = (select seq from tb_agent where a_id = '${param.memId}')
            UNION ALL
            SELECT t2.seq, t2.a_id, t2.a_nm ,t3.unit + 1 as unit  ,t2.upper_seq, t2.a_rate
            FROM tb_agent t2
            INNER JOIN t3 ON t2.upper_seq  = t3.seq 
        )

        SELECT t0.seq as name, t0.a_id , 
         t0.a_nm ,0 AS boss, t0.upper_seq  as parent_id,t0.a_rate  FROM tb_agent t0
        WHERE t0.seq = (select seq from tb_agent where a_id = '${param.memId}')
        UNION ALL
        SELECT seq as name, a_id, a_nm ,unit as boss, upper_seq as parent_id, a_rate
          FROM t3;
      
        `

        console.log('fnGetRcmmndrList ==>', sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }


            resolve(ret);
        });
    });
}

module.exports.QGetRcmmndrList = fnGetRcmmndrList;