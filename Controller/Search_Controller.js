const db = require("../Config/Mysql")
// search by name
module.exports.searchByName=(req,resp)=>{
    let name=req.params.name
    let query='select gc.person_name,gc.phone,if(sp.spam_count is null,0,sp.spam_count) as spam_count'
    +' from global_contacts gc left join spammers sp on sp.phone=gc.phone'
    +' where gc.person_name like ? '
    +'union '
    +'select gc.person_name,gc.phone,if(sp.spam_count is null,0,sp.spam_count) as spam_count '
    +'from global_contacts gc left join spammers sp on sp.phone=gc.phone '
    +'where gc.person_name like ?'
    db.query(query,[name,`%${name}%`],(error,result)=>{
        //if error in fetching data
        if(error){
            resp.status(500).json({
                code:'1001',
                message:'Internal server error'
            })
        }
        console.log(result)
        resp.status(200).json({
            code:'1000',
            message:'success',
            data:result
        })
    })
}


//search by phone no
module.exports.searchByPhone=(req,resp)=>{
    let phone=req.params.phone
    let query='select gc.person_name,gc.phone,if(sp.spam_count is null,0,sp.spam_count) as spam_count,gc.is_registered '
    +'from global_contacts gc left join spammers sp on sp.phone=gc.phone '
    +'where gc.phone=? '
    +'and if((select phone from global_contacts where phone=? and is_registered=1 limit 1) is not null,gc.is_registered=1,null is null)'
    db.query(query,[phone,phone],(error,user)=>{
        //if error in fetching data
        if(error){
            resp.status(500).json({
                code:'1001',
                message:'Internal server error'
            })
        }
        
        return resp.status(200).json({
            code:'1000',
            message:'success',
            data:user
        })
        

    })
}   