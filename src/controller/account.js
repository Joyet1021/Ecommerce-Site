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

        const ggg = await signupModel.findOneAndUpdate({ _id: userId }, {
            $set: {
                username: username,
                email,
                phonenumber: phoneNumber
            }
        });

        console.log(ggg);
        console.log("Request Body:", req.body);
        console.log(userId);

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
            newAddress: [address]
        };

        if (req.file && req.file.filename && !req.file.filename == ' ') {
            console.log('hii');
            const img = oldProfile.userImage;
            console.log(img,'inmg');
            const imagePath = './public/'+'uploads/' +'profiles/'+ img;
console.log(imagePath,'path');
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await profileModel.updateOne({ userId }, { $set: updatedProfileData });

        console.log("Updated Profile:", updatedProfileData);

        res.status(200).json({ success: true, message: "Address added successfully", data: updatedProfileData });

    } catch (error) {
        console.error("Error in adding address:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}
