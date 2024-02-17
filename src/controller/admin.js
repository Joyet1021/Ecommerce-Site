

const signupModel=require('./../../Models/signupmodel')

const flash = require("connect-flash")
const session=require('express-session');


exports.userslistGet = async (req, res) => {
    try {
    
      const userData = await signupModel.find({ role: 'user', blocked: false });
      res.render('admin/userslist', { userData });
    } catch (error) {
      
      console.error('Error fetching user data:', error.message);
      res.status(500).send('Internal Server Error');
    }
  };

exports.blockuser=async(req,res)=>{
    try{
        const  id = req.query.id;
        await  signupModel.findOneAndUpdate(
          { _id : id },
          {
            $set:{
              blocked:true
            }
          })
          
        res.status(203).json({ success: true,  message: "Blocked user Successfully" })
        
        
    }catch(error){
      console.error('Error in blocking user:', error.message);
      res.status(500).send('Internal Server Error');

    }
}

exports.blockedusersGet=async(req,res)=>{
  try{
    const userData = await signupModel.find({ role: 'user', blocked: true });
    res.render('admin/blockedusers', { userData });
  }catch(error){
    console.error('Error fetching user data:', error.message);
    res.status(500).send('Internal Server Error');
  }
};

exports.unblockuser=async(req,res)=>{
  try{
      const  id = req.query.id;
      await  signupModel.findOneAndUpdate(
        { _id : id },
        {
          $set:{
            blocked:false
          }
        })
      
        res.status(203).json({ success: true,  message: "Unblocked user" })
  }catch(error){
    console.error('Error fetching user data:', error.message);
    res.status(500).send('Internal Server Error');
  }
}