import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const userId= req.User._id;
    // TODO: toggle subscription

    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid channel ID");
    }

    const channel =await User.findOne(channelId)
    if(!channel){
        throw new ApiError(400, "channel not found")
    }

    const existingSubscription= await Subscription.findOne({
        channel:channelId,
        subscriber:userId
    })

    if(existingSubscription){
        await Subscription.deleteOne({_id:existingSubscription})
        return res.status(200).json(new ApiResponse(200, null, "unsubscribed successfully"))
    }else{
        const newSubscriber =await Subscription.create({
            channel:channelId,
            subscriber:userId
        })

        return res.status(200).json(new ApiResponse(200, newSubscriber, "Subscribed successfully"))
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid channel ID");
    }

    const channel= await User.findById(channelId)
    if(!channel){
        throw new ApiError(404,"Channel not found");
    }

    const subscribers= await Subscription.find({channel:channelId}).populate("subscriber", "name email")
    if(!subscribers.length){
        return res.status(200).json(new ApiResponse(200, [], "No subscribers found for this channel"))
    }else{
        return res.status(200).json(new ApiResponse(200, subscribers, "subscribers fetched successfully"))
    }
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}