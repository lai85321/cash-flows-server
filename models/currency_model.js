const sqlBind = require("../util/sqlBind");


const getCurrencyList = async () => {
 const sql = `SELECT * FROM currency;`
 const result = sqlBind(sql,'')
 return result
};

module.exports = {
    getCurrencyList
};
