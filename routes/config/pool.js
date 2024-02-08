const mysql   = require("mysql2"),
      util    = require('util'),
      Promise = require("bluebird");

Promise.promisifyAll(mysql);
Promise.promisifyAll(require("mysql/lib/Connection").prototype);
Promise.promisifyAll(require("mysql/lib/Pool").prototype);

const PropertiesReader = require('properties-reader');
const properties = PropertiesReader('adm.properties');
const host = properties.get('com.db.host');
const user = properties.get('com.db.user');
const pass = properties.get('com.db.pass');
const database = properties.get('com.db.database');

const DB_INFO = {
  host     : host,
  user     : user,
  password : pass,
  database : database,
  multipleStatements: true,
  connectionLimit:50,
  waitForConnections:false
};

module.exports = class {
  constructor(dbinfo) {
    dbinfo = dbinfo || DB_INFO;
    this.pool = mysql.createPool(dbinfo);
  }

  connect() {
    return this.pool.getConnectionAsync().disposer(conn => {
      
      console.log("==========mysql release==============")
      return conn.release();
    });
  }

  end() {
    this.pool.end( function(err) {
      util.log(">>>>>>>>>>>>>>>>>>>>>>>>>>> End of Pool!!");
      if (err)
        util.log("ERR pool ending!!");
    });
  }
};
