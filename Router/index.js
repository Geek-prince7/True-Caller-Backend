const express=require('express');
const router=express.Router();

router.use('/user',require('./user'))
router.use('/search',require('./search'))

module.exports=router;