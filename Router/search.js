const express=require('express');
const router=express.Router();
const searchController=require('../Controller/Search_Controller')
const passport=require('passport')

router.get('/name/:name',passport.authenticate('jwt',{session:false}),searchController.searchByName)
router.get('/phone/:phone',passport.authenticate('jwt',{session:false}),searchController.searchByPhone)


module.exports=router