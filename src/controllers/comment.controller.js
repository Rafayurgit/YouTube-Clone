import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId}= req.params;
    const {page=1, limit=10}= req.query;

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid video Id")
    }

    const comments =await Comment.find({video: videoId})
    .skip((page-1)*limit)
    .limit(parseInt(limit))
    .sort({createdAt: -1})

    return res.status(200)
    .json(new ApiResponse (200, comments, "Comments fetched successfully"))
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId}= req.params;
    const {content}= req.body;
    const userId=req.user._id;

    if(!mongoose.Types.isValid(videoId)){
        throw new ApiError(400,"Invalid video Id");
    }

    const comment= await Comment.create({
        video:videoId,
        content:content,
        owner:userId,
    })

    return res.status(201)
    .json(new ApiResponse(201, comment, "Added comment successfully "))

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId}= req.params;
    const {content} = req.body;
    const userId= req.user._id;

    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400,"Invalid video ID");
    }

    const comment =await Comment.findOneAndUpdate(
        {_id:commentId, owner:userId},
        {content:content},
        {new :true}
    )

    if(!comment){
        throw new ApiError(404, "Comment not found or not authorized");
        
    }
    
    return res.status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully"))

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }