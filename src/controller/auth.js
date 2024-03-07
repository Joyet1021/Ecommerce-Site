const signupModel = require('./../../Models/signupmodel');
const orderModel=require('./../../Models/order')
const dotenv=require('dotenv').config()
const bcrypt = require('bcrypt');
const twilio = require('twilio');
const mailOTP = require('../middlewares/otp')
const accountsid = process.env.accountsId;
const authToken =process.env.authToken;
const verifysid = process.env.verifysId;
const client =twilio(accountsid, authToken);
var nodemailer = require('nodemailer');
const flash=require('connect-flash');


const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

exports.usersignupGet = async (req, res)=> {
    try {
        const error = req.flash('error');
        res.render('user/signup', { error });
    } catch (error) {
        console.error("Error in usersignupGet:", error);
        res.status(500).send("Internal Server Error");
    }
};


exports.usersignupPost = async (req, res) => {
    try {
        const { username, email, phonenumber, password, confirmPassword } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newSchema = new signupModel({
            username,
            email,
            phonenumber,
            password: hashedPassword,
            role: 'user',
            verified: false
        });

        const validatingEmail = emailRegex.test(email);
        const validatingPassword = passwordRegex.test(password);
        const signupDatas = await signupModel.find();
        const userExist = signupDatas.find((value) => value.email === email);

        if (!username || !email || !phonenumber || !password || !confirmPassword) {
            req.flash("error", "All fields are required");
            return res.status(400).redirect('/signup'); // Bad Request
        } else if (!validatingEmail) {
            req.flash("error", "Please enter a valid email address");
            return res.status(400).redirect("/signup"); // Bad Request
        } else if (!validatingPassword) {
            req.flash("error", "Please enter a valid password");
            return res.status(400).redirect('/signup'); // Bad Request
        } else if (password !== confirmPassword) {
            req.flash("error", "Passwords do not match");
            return res.status(400).redirect('/signup'); // Bad Request
        } else if (userExist) {
            req.flash("error", "User already exists with this Email ID.");
            return res.status(409).redirect('/user/signup'); // Conflict - User already exists
        } else {
            await newSchema.save();

            const twiliophone = phonenumber;
            if (phonenumber) {
                const verification = await client.verify.v2.services(verifysid)
                    .verifications
                    .create({ to: `+91${twiliophone}`, channel: 'sms' })
                    .then((verification) => console.log(verification.status))
                    .catch((error) => console.log((error.message)));

                return res.status(200).redirect(`/user/sendotp/${phonenumber}`); // OK
            }
        }
    } catch (error) {
        return res.status(500).redirect('/user/signup'); // Internal Server Error
    }
};

exports.sendotpget = (req, res) => {
    const phone = req.params.num
    res.render('user/sendotp',{phone});
    
};

exports.sendotpPost = async (req, res) => {
    try {
        const phone = req.params.num;
        
        const otpA = req.body.a;
        const otpB = req.body.b;
        const otpC = req.body.c;
        const otpD = req.body.d;
        const otpE = req.body.e;
        const otpF = req.body.f;

        const otp = otpA + otpB + otpC + otpD + otpE + otpF;
        const user = await signupModel.findOne({ phonenumber: phone });
        

        if (!user) {
            res.render('user/sendotp',{phone,error:"User not found"})
            
        }

        const verification_check = await client.verify.v2.services(verifysid)
            .verificationChecks
            .create({ to: `+91${phone}`, code: otp });

        if (verification_check.status === 'approved') {
            await signupModel.updateOne({ phonenumber: phone }, { $set: { verified: true } });
            res.render('user/login');
        } else {
            res.render('user/sendotp',{phone,error:"Incorrect  OTP"})
        }
    } catch (err) {
        res.render('user/login', { error: 'Server Error' }); 
    }
};

exports.userloginGet = function (req, res) {
    const error = req.flash('error');
    res.render('user/login',{error});
    
};
exports.userloginPost = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userDatas = await signupModel.find();
        const userExist = userDatas.find((val) => val.email === email);
        if (!userExist) {
            req.flash("error", "User Doesn't Exist");
            return res.status(400).redirect('/user/login');
             
        } else {
            const comparePassword = await bcrypt.compare(password, userExist.password);
            const phone = userExist.phonenumber;

            if (comparePassword) {
                if (userExist.verified === true) {
                    if (userExist.role === "admin") {
                        req.session.admin = adminExist;
                        res.render("admin/adminhome");
                    } else {
                        if (userExist.blocked) {
                            req.flash("error", "User has been blocked");
                            return res.status(400).redirect('/user/login');
                        } else {
                            req.session.user = userExist;
                            res.redirect("/user/userhome");
                        }
                    }
                } else {
                    res.redirect(`/user/resendotp/${phone}`);
                }
            } else {
                req.flash("error", "Incorrect Password");
                return res.status(400).redirect('/user/login');
            }
        }
    } catch (error) {
        res.render('user/login', { error: 'Internal Server Error' });
    }
};

exports.forgotpasswordGet=(req,res)=>{
    res.render('user/forgotpassword')
}

exports.forgotpasswordPost=async(req,res)=>{
    try{
        const{email}=req.body
        const userDatas=await signupModel.find()
        const userExist=userDatas.find((val)=>val.email===email)
        if(!userExist){
            res.redirect("/user/login")
        }else{
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: 'joyetjoyasi@gmail.com',
                  pass: 'etja nfps utyg phkw'
                }
              });
              
              var mailOptions = {
                from: 'joyetjoyasi@gmail.com',
                to: `${email}`,
                subject: 'Sending Email using Node.js',
                text: `Your OTP is ${mailOTP.otp}`
              };
              
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent');
                }
              });
              console.log("forget password otp send successfully");
              res.redirect(`/user/forgototp/${email}`)
        }
    }catch(error){
        res.render('user/forgotpassword',{error:'Try after sometime'})
        
    }

    
}


exports.forgototpGet=(req,res)=>{
    const email=req.params.mail
    
    res.render('user/forgototp',{email,})
    
}
exports.resendotp = async (req, res) => {
    try {
        const phone = req.params.num;
        const verification = await client.verify.v2.services(verifysid)
            .verifications
            .create({ to: `+91${phone}`, channel: 'sms' });
        res.redirect(`/user/sendotp/${phone}`);
    } catch (error) {
        res.render('error', { error: 'Failed to resend OTP. Please try again.' });
    }
};

exports.forgototpPost=async(req,res)=>{
    try{
        const email = req.params.mail;
        
        
        const otpA = req.body.a;
        const otpB = req.body.b;
        const otpC = req.body.c;
        const otpD = req.body.d;
        const otp = otpA + otpB + otpC + otpD ;
        const user = await signupModel.findOne({ email:email });
       

        if (!user) {
            console.log('User not found');
            res.redirect('/user/login');  // or handle the error accordingly
            return;
        }
        if(otp==mailOTP.otp){
            res.redirect(`/user/resetpasswordGet/${email}`)
        } else {
            
            res.redirect('/user/forgototp',{email})
        }
        


    }catch(error){
        console.log("Error in forgot password page ", error)
    }

}

exports.resetpasswordGet=(req,res)=>{
    const email=req.params.mail;
    
    
    res.render('user/resetpassword',{email})
}


exports.resetpasswordPost = async (req, res) => {
    const email = req.params.mail;
    const { password, confirmpassword } = req.body;

    const validatingPassword = passwordRegex.test(password);

    if (!password || !confirmpassword || !validatingPassword || password !== confirmpassword) {
        // Handle invalid password scenarios, render appropriate error messages
        return res.render('user/resetpassword', { email, error: 'Invalid password or passwords do not match' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await signupModel.updateOne({ email: email }, { $set: { password: hashedPassword } });

        // Password updated successfully, you may want to redirect to a success page
        res.redirect("/user/login");
    } catch (error) {
        // Handle any errors that occurred during the password update process
        console.error('Error updating password:', error);
        res.status(500).render('error', { error: 'Internal Server Error' });
    }
};



exports.adminhomeGet=async(req,res)=>{
    const total = await orderModel.aggregate([
        {
            $match: { status: 'Delivered' } // Filter by status
        },
        {
            $group: {
                _id: null,
                totalSales: { $sum: { $toDouble: '$total' } }
            }
        },
        {
            $project: {
                _id: 0,
                totalSales: 1
            }
        }
    ]).exec();
    res.render('admin/adminhome',{total})
}

