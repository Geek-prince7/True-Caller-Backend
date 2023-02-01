const express=require('express');
const router=express.Router();
const userController=require('../Controller/User_Controller')
const passport=require('passport')
router.post('/register',userController.registerUser)


router.post('/login',userController.login)

router.post('/mark-spam/:phone',passport.authenticate('jwt',{session:false}),userController.markSpam)

router.get('/get-detail/:globalId',passport.authenticate('jwt',{session:false}),userController.userDetail)


module.exports=router;