import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const userId= req.user._id;
    const {content} = req.body;

    if(!content || content.trim()===""){
        throw new ApiError(400,"Tweet Content can not be empty");
    }

    const newTweet= await Tweet.create({
        content:content,
        owner:userId
    })

    return res.
    status(201)
    .json(new ApiResponse(200, null, "Tweet created successfully"))


})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const userId= req.user._id;
    
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid user Id");  
    }

    const user= await User.findById(userId);
    if(!user){
        throw new ApiError(400,"User not found");   
    }

    const tweets= await Tweet.find({owner:user}).sort("-createdAt")

    return res.status(200)
    .json(new ApiResponse(200, tweets, "Tweets fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {content}= req.body;
    const {tweetId} =req.params;
    const userId= req.user._id;

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet id")
    }

    if(!content || content.trim()===""){
        throw new ApiError(400,"Tweet contnet can't be empty");
    }

    const tweet= await Tweet.findById(userId);
    if(!tweet){
        throw new ApiError(404,"Tweet not found"); 
    }
    if(String(tweet.owner)!== String(userId)){
        throw new ApiError(403,"Not authorized to update tweet");
    }

    tweet.content= content;
    await tweet.save();

    return res.status(200).json(new ApiResponse(200, tweet, "Tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const userId= req.user._id;
    const {tweetId}= req.params;

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid tweet Id");
    }

    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(404,"Tweet not found");   
    }
    if(String(tweet.owner)!==String(userId)){
        throw new ApiError(403,"Not authorized to delete tweet");   
    }

    await Tweet.deleteOne({_id:tweetId})

    return res.status(200)
    .json(new ApiResponse(200, null, "Tweet deleted successfully"))

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}