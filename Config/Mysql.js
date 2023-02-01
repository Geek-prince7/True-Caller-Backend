const mysql=require('mysql')
const db=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"Bittu@2019",
    database : "caller"
})
db.connect((error)=>{
    console.log(error || `Db is connected`)
})
module.exports=db