import Profile from "../models/profile.model.js";
import User from "../models/user.model.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import PDFDocument from "pdfkit";
import fs from "fs";

export const convertUserDataTOPDF = async (userData) => {

    const doc = new PDFDocument();

    const outputPath  = crypto.randomBytes(32).toString("hex") + ".pdf";
    const stream = fs.createWriteStream("uploads/" + outputPath);

    doc.pipe(stream);
    console.log("userData:", userData);
    console.log("userData.userId:", userData.userId);
    console.log("userData.userId.profile:", userData?.userId?.profile);

    if (userData.userId && userData.userId.profile) {
        try {
            doc.image(`uploads/${userData.userId.profile}`, { align: "center", width: 100 });
        } catch (err) {
            console.log("Image load failed:", err.message);
        }
    }
  

    doc.fontSize(14).text(`Name: ${userData.userId.name}`);
    
    doc.fontSize(14).text(`Username: ${userData.userId.username}`); 
    doc.fontSize(14).text(`Email: ${userData.userId.email}`);
    doc.fontSize(14).text(`Bio: ${userData.bio}`);
    doc.fontSize(14).text(`Current Post: ${userData.currentPost}`);

    doc.fontSize(14).text("Past Work: ");
    userData.pastWork.forEach((work, index) => {
        doc.fontSize(14).text(`Company Name: ${work.companyName}`);
        doc.fontSize(14).text(`Position: ${work.position}`);
        doc.fontSize(14).text(`Years: ${work.years}`);
    });

    doc.end();

    return outputPath;



}
export const register = async (req, res) => {
    console.log(req.body);
    try {
        const { name, email, password, username } = req.body;

        if (!name || !email || !password || !username) 
            return res.status(400).json({
                message: "All fields are required",
                status: "error"
            });
            const user = await User.findOne({
                email: email
            });
        if (user) return res.status(400).json({
            message: "User already exists",
        });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            username
        });

        await newUser.save();

        const profile = new Profile({
            userId: newUser._id
        });

        await profile.save();
        
        return res.json({
            message: "User registered successfully",
            status: "success",
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const login = async (req, res) => {
    console.log(req.body);
    try {
        const { email, password } = req.body;

        if (!email || !password) 
            return res.status(400).json({
                message: "All fields are required"
            });

        const user = await User.findOne({ email: email });
        if (!user) return res.status(404).json({
            message: "User not found" 
        });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({
            message: "Invalid credentials"
        });

        const token = crypto.randomBytes(32).toString("hex");
        
        await User.updateOne({ _id: user._id }, { token });
        
        return res.status(200).json({
            message: "Login successful",
            token,
          });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

export const uploadProfilePicture = async (req, res) => {
    const { token } = req.body;

    try {
       
        const user = await User.findOne({ token });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.profile = req.file.filename;
        await user.save();
        return res.json({
            message: "Profile picture uploaded successfully"
        })
    
    } catch (error) {
       return res.status(500).json({message:error.message}) 
    }
}

export const updateUserProfile = async (req, res) => {
    try {
        const { token, ...newUserData } = req.body;
        
        const user = await User.findOne({ token: token });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        const { username, email } = newUserData;
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        
        if (existingUser) {
            if (existingUser && String(existingUser._id) !== String(user._id)) {
                return res.status(400).json({
                    message: "Useralready exists"
                });
            }
        }
        Object.assign(user, newUserData);
        await user.save();
        return res.json({ message: "User Updated" });
    }
    catch (error) {
        
        }
};
    
export const getUserAndProfile = async (req, res) => {
    try {
        const { token } = req.body;

        const user = await User.findOne({ token: token });
        
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        const userProfile = await Profile.findOne({ userId: user._id })
            .populate('userId', 'name email username profile');
     
        return res.json(userProfile);
    
    }
    catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

export const updateProfileData = async (req, res) => {
    
    try {
        const {token, ...newProfileData} = req.body;
        const userProfile = await User.findOne({ token: token });
        if (!userProfile) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        const profile_to_update = await Profile.findOne({ userId: userProfile._id });
        
        Object.assign(profile_to_update, newProfileData);
        
        await profile_to_update.save();
        
        return res.json({
            message: "Profile updated successfully"
        });

    }catch(error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

export const getAllUserProfile = async (req, res) => {
    try {
        const profiles = await Profile.find().populate('userId', 'name email username profile');
        
        return res.json({profiles});
    
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}


export const downloadProfile = async (req, res) => {
    try {
        const user_id = req.query.id;

        if (!user_id || !mongoose.Types.ObjectId.isValid(user_id)) {
            return res.status(400).json({ error: "Invalid or missing User ID" });
        }

        const userProfile = await Profile.findOne({ userId: user_id })
            .populate("userId", "name email username profile");

        if (!userProfile) {
            return res.status(404).json({ error: "User profile not found" });
        }

        const outputPath = await convertUserDataTOPDF(userProfile);

        return res.download("uploads/" + outputPath, (err) => {
            if (err) {
                console.error("Error sending file:", err);
                return res.status(500).json({ error: "Error sending PDF file" });
            }
        });
    } catch (err) {
        console.error("Download error:", err);
        return res.status(500).json({ error: "Server error while downloading profile" });
    }
};