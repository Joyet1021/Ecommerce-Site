const profileModel = require('../../Models/userprofile');
const signupModel = require('./../../Models/signupmodel');
const fs=require( "fs");

exports.addressGet = async (req, res) => {
    try {
        const userId = req.session.user ? req.session.user._id : null;
        if (!userId) {
            return res.redirect('/user/login');
        }
        const user = req.session.user;
        const userName=user.username
        const email = user.email;
        const number = user.phonenumber;

        let userdata = await profileModel.findOne({ userId: userId });

        if (!userdata) {
            userdata = await new profileModel({
                userId:userId,
                userImage: '',
                userName: userName,
                firstName: '',
                lastName: '',
                email: email,
                phoneNumber: number,
                dateofBirth: '',
                country: '',
                district: '',
                state: '',
                landMark: '',
                zip:'', 
                Address: '',
                newAddress:[]
            }).save();
        }

        const profiledata = await profileModel.findOne({ userId: userId });
        let data='false';
        let img='false';
        if(!profiledata.firstName==' '){
            data='true';
        }
        if(!profiledata.userImage==' '){
            img='true';
        }
        
        res.render('user/addaddress',{profiledata,data,img});

    } catch (error) {
        console.error('Error in addaddressGet', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}
exports.addAddressPost = async (req, res) => {
    try {
        const userId = req.session.user ? req.session.user._id : null;
        let userImage = req.file ? req.file.filename : null;
        const { firstName, lastName, dateofBirth, country, state, district, zip, landMark, Address, username, phoneNumber, email } = req.body;
        const address = Address + ' Pin ' + zip;

        await signupModel.findOneAndUpdate({ _id: userId }, {
            $set: {
                username: username,
                email,
                phonenumber: phoneNumber
            }
        });

        const oldProfile = await profileModel.findOne({ userId });

        let updatedProfileData = {
            userImage: userImage || oldProfile.userImage,
            userName:username,
            firstName,
            lastName,
            phoneNumber,
            email,
            dateofBirth,
            country,
            district,
            state,
            landMark,
            zip,
            Address,
            newAddress: [{
                firstName,
                lastName,
                phoneNumber,
                country,
                district,
                state,
                zip,
                Address,
            }]
        };


        if (req.file && req.file.filename && req.file.filename !== ' ') {
            const img = oldProfile.userImage;
            if (!img == ' ') {
                
                const imagePath = './public/'+'uploads/' +'profiles/'+ img;
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
        }
        

        await profileModel.updateOne({ userId }, { $set: updatedProfileData });

        res.status(200).json({ success: true, message: "Address added successfully", data: updatedProfileData });

    } catch (error) {
        console.error("Error in adding address:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

exports.altaddressGet=async (req,res)=>{
    try{
        const userId = req.session.user ? req.session.user._id : null;
        const profiledata = await profileModel.findOne({ userId: userId });
        let img='false';
        if(!profiledata.userImage==' '){
            img='true';
        }
        res.render("user/altaddress",{profiledata,img})

    }catch{

    }
}
exports.altaddressPost = async (req, res) => {
    try {
        console.log(req.body);
        const userId = req.session.user ? req.session.user._id : null;
        const { firstName, lastName, phoneNumber, dateofBirth, country, state, district, zip, landMark, Address } = req.body;

        const data = await profileModel.findOne({ userId });

        // Push the new address to the existing addresses array
        data.newAddress.push({
            firstName,
            lastName,
            phoneNumber,
            dateofBirth,
            country,
            state,
            district,
            zip,
            landMark,
            Address
        });

        // Save the updated user profile
        await data.save();
        res.redirect('/user/Address')
    } catch (error) {
        console.error('Error adding address:', error);
        res.status(500).json({ success: false, message: 'Failed to add address' });
    }
}

