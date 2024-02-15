

const signupModel=require('./../../Models/signupmodel')

const flash = require("connect-flash")
const session=require('express-session');


exports.userslistGet = async (req, res) => {
    try {
    
      const userData = await signupModel.find().where('role').equals('user');
  
      
      res.render('admin/userslist', { userData });
    } catch (error) {
      
      console.error('Error fetching user data:', error.message);
      res.status(500).send('Internal Server Error');
    }
  };

exports.deleteuser=async(req,res)=>{
    try{
        const  id = req.params.id;
        await  signupModel.deleteOne({ _id : id })
        const  userData = await signupModel.find().where('role').equals('user')
        res.render('admin/userlist',{userData})
    }catch{

    }
}