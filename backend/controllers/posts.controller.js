import Profile from "../models/profile.model.js";
import User from "../models/user.model.js";

import bcrypt from "bcrypt";


export const activeCheck = async (req, res) => {
    return res.status(200).json({
        message: "Server is active",
        status: "success"
    })
}

