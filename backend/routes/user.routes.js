import { Router } from 'express';
import { register } from '../controllers/user.controller.js';
import { login } from '../controllers/user.controller.js';
import { uploadProfilePicture } from '../controllers/user.controller.js';
import { updateUserProfile } from '../controllers/user.controller.js';
import { getUserAndProfile } from '../controllers/user.controller.js';  
import { updateProfileData } from '../controllers/user.controller.js';
import { getAllUserProfile } from '../controllers/user.controller.js';  
import { downloadProfile } from '../controllers/user.controller.js';

import multer from 'multer';

const router = Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});


const upload = multer({storage});
router.route('/update_profile_picture')
    .post(upload.single('profilePicture'), uploadProfilePicture)

router.route('/register').post(register);
router.route('/login').post(login); 
router.route("/user_update").post(updateUserProfile);
router.route("/get_user_and_profile").post(getUserAndProfile)
router.route("/update_profile_data").post(updateProfileData);
router.route("/user/get_all_users").get(getAllUserProfile);
router.route("/user/download_resume").get(downloadProfile);

export default router;