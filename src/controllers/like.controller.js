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
        likedBy:userId
    })

    if(existingLike){
        await Like.deleteOne({ _id: existingLike._id})
        return res.status(200).json(new ApiResponse(200, null," video Unliked successfully"))
    }else{
        const newLike= await Like.create({
            video:videoId,
            likedBy:userId
        })

        return res.status(200).json(new ApiResponse(200, newLike, "Video liked successfully"))
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    const userId= req.user._id;
    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment Id");
    }

    const existingCommentLike= await Like.findOne({
        comment:commentId,
        likedBy:userId
    })

    if(existingCommentLike){
        await Like.deleteOne({_id: existingCommentLike._id})
        return res.status(200).json(new ApiResponse(200, null, "Unliked comment Successfully"))
    }else{
        const newCommentLike= await Like.create({
            comment:commentId,
            likedBy:userId
        })
        return res.status(200).json(new ApiResponse(200, newCommentLike, "Liked comment successfully"))

    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const userId= req.user._id;
    //TODO: toggle like on tweet

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid tweet Id");
    }

    const existingTweetLike= await Like.findOne({
        tweet:tweetId,
        likedBy:userId
    })

    if(existingTweetLike){
        await Like.deleteOne({_id: existingTweetLike._id})
        return res.status(200).json(new ApiResponse(200, null, "unliked tweet successfully"))
    }else{
        const newTweetLike= await Like.create({
            tweet:tweetId,
            likedBy:userId
        })

        return res.status(200).json(new ApiResponse(200, newTweetLike, "Liked tweet Successfully"))
    }

})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    
    const userId= req.user._id;

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video Id");
        
    }

    const likedVideos= await Like.find({
        likedBy:userId,
        video: {$exist:true}
    }).populate("video")

    if(likedVideos.length===0){
        return res.status(404).json(new ApiError(404, [], "No liked videos found"))
    }
    
    return res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos fetch successfully"))
    
})



export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}