import express from 'express';

import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';  
import postRoutes from './routes/posts.routes.js';
import userRoutes from './routes/user.routes.js';


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(postRoutes)
app.use(userRoutes);
app.use(express.static('uploads')); //relative path



const start = async () => {
   
    const connectDB = await mongoose.connect("mongodb+srv://Anshika_Yadav:Anshika.nitkkr488430@linkverse.1j7b8zc.mongodb.net/?retryWrites=true&w=majority&appName=LinkVerse")
    


    app.listen(9090, () => {
        console.log("Server is running on port 9090");
    }   
)};

start();

