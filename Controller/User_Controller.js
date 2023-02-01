const db=require('../Config/Mysql')
const jwt=require('jsonwebtoken')

//Register controller
module.exports.registerUser=(req,resp)=>{
    //check if password and confirm password mismatch
    if(req.body.pwd!=req.body.cnf_pwd){
        return resp.status(200).json({
            code:'1001',
            message:'password mismatch'
        })
    }
    //check if all mandatory feild are present
    if(checkValidation(req.body.name) &&  checkValidation(req.body.phone) && checkValidation(req.body.pwd)){
        // check if the phone no already registerd
        db.query(`select * from users where phone=?`,[req.body.phone],(error,data)=>{
            //if error in fetching data
            if(error){
                resp.status(500).json({
                    code:'1001',
                    message:'Internal server error'
                })
            }
            //if already exist
            if(data!=null && data !=undefined && data!=''){
                console.log(data)
                resp.status(200).json({
                    code:'1001',
                    message:'user is already registered'
                })
            }
            //if not present in db
            else{
                //saving in db
                db.query(`insert into users (phone,person_name,email,pass) values (?,?,?,?)`,[req.body.phone,req.body.name,req.body.email,req.body.pwd],(error,dataa)=>{
                    //error while saving
                    if(error){
                        console.log(error)
                        return resp.status(200).json({
                            code:'1001',
                            message:'error in saving to db'
                        })
                    }
                    //save in global db
                    db.query('insert into global_contacts (user_id,person_name,phone,email,is_registered) values ((select user_id from users where phone=? limit 1),?,?,?,1)',[req.body.phone,req.body.name,req.body.phone,req.body.email],(error,user)=>{
                        if(error){
                            console.log(error)
                            return resp.status(200).json({
                                code:'1001',
                                message:'error in saving to db'
                            })

                        }
                        // sending success response
                        return resp.status(200).json({
                            code:'1000',
                            message:'saved to db'
                        })
                    })
                    
        
                })
            }
        })


    }
    //if all required feilds are not present
    else{
        resp.status(200).json({
            code:'1001',
            message:'feilds validation failed'
        })

    }

    
}






//login controller
module.exports.login=(req,resp)=>{
    db.query('select * from users where phone=?',[req.body.phone],(error,data)=>{
        if(error){
            resp.status(500).json({
                code:'1001',
                message:'Internal server error'
            })
        }
        if(data=='' || data[0].pass!=req.body.pwd){
            return resp.json(422,{
                code:'1001',
                message:'invalid username/password'
                
            })
        }
        const payload = {
            data: data[0]
        }
        const options = {
            subject: `${data[0].user_id}`,
            expiresIn: 3600*100
        }
        resp.status(200).json({
            code:'1000',
            message:'login success keep your token',
            data:{
                token:jwt.sign(payload,'caller',options)

            }
        })
    })

}

//mark spam
module.exports.markSpam=(req,resp)=>{
    let phone=req.params.phone
    console.log('-----------------request user -------------------',req.user[0],'---------------------')
    if(phone==req.user[0].phone){
        return resp.status(200).json({
            code:'1001',
            message:'cant spam yourself'
        })
    }

    //find if no is in global db or not
    db.query('select gc.phone,sp.spam_count,sp.spammed_by from global_contacts gc left join spammers sp on sp.phone=gc.phone  where gc.phone=?',[phone],(error,data)=>{
        if(error){
            resp.status(500).json({
                code:'1001',
                message:'Internal server error'
            })
        }
        console.log(data)
        // resp.status(200).json({a:'b'})
        //if exist a number already
        if(data.length>0){

            //if not exist in spammer create
            if(data[0].spam_count==null || data[0].spam_count==0){
                db.query('insert into spammers (phone,spam_count,spammed_by) values (?,1,?)',[phone,req.user[0].phone],(error,result)=>{
                    if(error){
                        resp.status(500).json({
                            code:'1001',
                            message:'Internal server error'
                        })

                    }
                    resp.status(200).json({
                        code:'1000',
                        message:'added spam'
                    })
                })


            }
            //else update
            else{

                //check if this user spammed it already 
                let users=data[0].spammed_by.split(',')
                let user=users.filter(u=> u==req.user[0].phone)
                // console.log('user already spammed it',user)
                if(user.length==1){
                    return resp.status(200).json({
                        code:'1000',
                        message:'already spammed'
                    })
                }
                //then mark spam 
                users=users+`,${req.user[0].phone}`
                db.query('update spammers set spam_count=? ,spammed_by=? where phone=?',[parseInt(data[0].spam_count)+1,users,phone],(error,response)=>{
                    if(error){
                        return resp.status(500).json({
                            code:'1001',
                            message:'Internal server error'
                        })

                    }
                    else{
                        return resp.status(200).json({
                            code:'1000',
                            message:'updated spam'
                        })
                    }
                })
            }

        }
        //if number not in global db add a personal contact with name user and add in global db and add spam
        else{
            db.query('insert into personal_contact (person_name,phone,contact_of) values (?,?,?)',['user',phone,req.user[0].phone],(error,result)=>{
                if(error){
                    return resp.status(500).json({
                        code:'1001',
                        message:'Internal server error'
                    })

                }
                //insert into global db
                db.query('insert into global_contacts (user_id,person_name,phone,email,is_registered) values ((select user_id from personal_contact where phone=? and contact_of=? limit 1),?,?,?,0)',[phone,req.user[0].phone,'user',phone,null],(error,user)=>{
                    if(error){
                        return resp.status(500).json({
                            code:'1001',
                            message:'Internal server error'
                        })
    
                    }
                    //save in spammer
                    db.query('insert into spammers (phone,spam_count,spammed_by) values (?,1,?)',[phone,req.user[0].phone],(error,result)=>{
                        if(error){
                            return resp.status(500).json({
                                code:'1001',
                                message:'Internal server error'
                            })
        
                        }
                        return resp.status(200).json({
                            code:'1000',
                            message:'added to spam'
                        })
                    })
                })

            })
        }
        

    })

}


//get a user detail
module.exports.userDetail=(req,resp)=>{
    let id=req.params.globalId
    console.log(id)
    //find the details
    db.query('select * from global_contacts where id=?',[id],(error,data)=>{
        if(error){
            return resp.status(500).json({
                code:'1001',
                message:'Internal server error'
            })
            

        }
        let query='select gc.person_name,gc.phone'
        +',if(sp.spam_count is null,0,sp.spam_count) as spam_count'
        +',gc.is_registered'
        +',if((select contact_of from personal_contact where contact_of=? and phone=? limit 1) is null,0,1) as in_phonebook'
        +',if((select contact_of from personal_contact where contact_of=? and phone=? limit 1) is not null and gc.is_registered=1,gc.email,"hidden") as email '
        +'from global_contacts gc left join spammers sp on sp.phone=gc.phone where gc.id=? '
        db.query(query,[req.user[0].phone,data[0].phone,req.user[0].phone,data[0].phone,id],(error,result)=>{
            if(error){
                return resp.status(500).json({
                    code:'1001',
                    message:'Internal server error'
                })
            }
            return resp.status(200).json({
                code:'1000',
                message:'success',
                data:result
            })

        })

    })



}











//function to check basic validation 
function checkValidation(feild){
    if(feild==undefined || feild == null || feild==''){
        return false;
    }
    return true;
}