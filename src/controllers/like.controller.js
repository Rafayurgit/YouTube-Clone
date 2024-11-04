import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const userId= req.user._id;

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video Id");
    }

    const existingLike= await Like.findOne({
        video:videoId,
        user:userId
    })

    if(existingLike){
        await Like.deleteOne({ _id: existingLike._id})
        return res.status(200).json(new ApiResponse(200, null," video Unliked successfully"))
    }else{
        const newLike= await Like.create({
            video:videoId,
            user:userId
        })

        return res.status(200).json(new ApiResponse(200, newLike, "Video liked successfully"))
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})



export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}