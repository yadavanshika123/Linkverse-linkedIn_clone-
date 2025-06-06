import mongoose from "mongoose";    



const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', //mongoose ke model ka naam
    },
    body: {
        type: String,
        required: true
    },
    likes: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.no
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    media: {
        type: String,
        default: null
    },
    active: {
        type: Boolean,
        default: true
    },
    fileType: {
        type: String,
        default: 'text'
    }
});


const Post = mongoose.model('Post', postSchema);
export default Post;