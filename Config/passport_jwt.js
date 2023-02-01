const passport=require('passport')
const jwtStrategy=require('passport-jwt').Strategy;
const extractJwt=require('passport-jwt').ExtractJwt;
const db=require('./Mysql')



let options={
    jwtFromRequest:extractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey:'caller'
}

passport.use(new jwtStrategy(options,(jwt_payload,done)=>{
    db.query('select * from users where user_id=?',[jwt_payload.sub],(error,user)=>{
        if(error)
        {
            console.log(error);
            return done(null);

        }
        if(user)
        {
            return done(null,user);
        }
        return done(null,false);

    })

}))


module.exports=passport;