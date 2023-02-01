const express=require('express')
const port=8000
const db=require('./Config/Mysql')
const session=require('express-session')
const passport=require('passport')
const passport_jwt=require('./Config/passport_jwt')
const app=express()

app.use(express.urlencoded())
app.use(session({
    name:'caller11',//key of cookie
    secret:'callers', // secret key
    saveUninitialized:false,
    resave:false,
    cookie:{
        maxAge:1000*60*100 // milliseconds 

    },
}))
app.use(passport.initialize());
app.use(passport.session());

app.use('/api',require('./Router/index'))

app.get('/',(req,resp)=>{
    resp.status(200).json({
        message:'response from server'
    })
    
})

app.listen(port,(error)=>{
    console.log(error || `Server is up on Port ${port}`)
})