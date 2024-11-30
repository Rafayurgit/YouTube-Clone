import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const {channelId}= req.params;

    if(!mongoose.isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid channel id");
    }

    const totalViews=await Video.aggregate([
        {$match:{owner: mongoose.Types.ObjectId(channelId)}},
        {$group: {_id:null, totalViews: {$sum:"$views"}}},
    ]);

    const views= totalViews.length>0 ? totalViews[0].totalViews : 0;

    const totalSubscribers=await Subscription.countDocuments({channelId});

    const totalVideos= await Video.countDocuments({owner:channelId});

    const totalLikes= await Like.aggregate([
        {
            $lookup: {
                from: "videos",
                localField: "videoId",
                foreignField: "_id",
                as: "video",
            },
            
        },
        {
            $match:{"video.owner": mongoose.Types.ObjectId(channelId)},
        },
        {
            $group:{_id: null , totalLikes :{$sum:1}},
        },
    ]);

    const likes= totalLikes.length>0 ? totalLikes[0].totalLikes :0;

    const stats={
        totalViews: views,
        totalSubscribers,
        totalVideos,
        totalLikes:likes
    };

    return res.status(200).json(new ApiResponse(200, stats, "Channel status fetched successfully"))


})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const {channelId}= req.params;

    if(!mongoose.isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid Channel Id");
    }

    const videos= await Video.find({owner:channelId});
    if(videos.length=== 0){
        return res
        .status(200)
        .json(new ApiResponse(200, [], "No videos found for this channel"));
    }

    return res.status(200).json(new ApiResponse(200, videos, "Channel videos fetched successfully"))
})

export {
    getChannelStats, 
    getChannelVideos
    }