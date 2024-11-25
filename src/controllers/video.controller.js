import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { Tweet } from "../models/tweet.model.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    const pageNumber = parseInt(page, 10);
    const pageSize= parseInt(limit, 10);

    if(NaN(pageNumber) || NaN(pageSize) || pageNumber < 1 || pageSize <1 ){
        throw new ApiError(400, "Invalid pagination parameters")
    }

    const filter={};
    if(query){
        filter.$or=[
            {title: {$regex: query, $options: 'i'}},
            {description:{$regex:query, $options: 'i'}}
        ];
    }

    if(userId){
        filter.owner=userId;
    }

    const sortOrder= sortType==="asc" ? 1 : -1;
    const sort={[sortBy]: sortOrder};

    const videos = await Video.find(filter).sort(sort).skip((pageNumber -1)*pageSize).limit(pageSize);

    const totalVideo= await Video.countDocuments(filter);

    return res.status(200)
    .json(new ApiResponse(200,{
        videos,
        pagination:{
            total:totalVideo,
            page:pageNumber,
            limit:pageSize,
            totalPages:Math.ceil(totalVideo/ pageSize)
        }
    } 
    , "Feteched all videos successfully"))
    
    



})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    const file =req.file;

    // TODO: get video, upload to cloudinary, create video
    if(!title || !description){
        throw new ApiError(400,"Invalid title or description")
    }
    if(!file){
        throw new ApiError(400,"Video file is required");
    }

    const videoUploadResponse= await uploadOnCloudinary(file.path)
    if(!videoUploadResponse){
        throw new ApiError(500,"Failed to upload video");   
    }

    const thumbNailResponse = req.body.thumbnail ? await uploadOnCloudinary(req.body.thumbnail) : null;

    const newVideo= await Video.create({
        videoFile:videoUploadResponse.url,
        thumbnail:thumbNailResponse ? thumbNailResponse.url : "",
        title,
        description,
        duration:req.body.duration || 0,
        owner: req.user._id
    })

    return res.status(201).json(new ApiResponse(201, newVideo, "Video published Successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video id");
    }

    const video= await Video.findById(videoId).populate("owner, email name ")
    if(!video){
        throw new ApiError(404,"Video not found");
    }

    return res.status(200).json(new ApiResponse(200, video, "video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId= req.user._id;
    const {title, description, thumbnail}= req.body;

    //TODO: update video details like title, description, thumbnail
    //validate videoID
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video Id");
    }
    //validate content
    if(!title && !description && !thumbnail){
        throw new ApiError(400,"No valid fileds to update")
    }
    //validate video
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video not found");
    }
    //validate ownership
    if(String(video.owner) !== String(userId)){
        throw new ApiError(403,"Not authorized to update video");
    }
    
    //update the video
    if(title) video.title=title;
    if(description) video.description=description;
    if(thumbnail) video.thumbnail=thumbnail;

    await video.save();
    
    // const updateVideo = await Video.findByIdAndUpdate(videoId, content, {new:true, runValidators:true})

    return res.status(200).json(new ApiResponse(200, video, "Video updated Successfully"))


})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId= req.user._id;


    //TODO: delete video
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video id");
    }

    const video= await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Video not found");
    }

    if(String(video.owner)!== String(userId)){
        throw new ApiError(403,"Not authentic user to delete the video");
    }

    await video.deleteOne();

    return res.status(200).json(new ApiResponse(200, null, "Successfully deleted the video"))


})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user._id;

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video Id");
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(403,"Video not found");
    }

    if(String(video.owner)!== String(userId)){
        throw new ApiError(403,"Not authorized to toggle status");
    }


    video.isPublished = !video.isPublished
                
    // if(video.isPublished===true){
    //     video.isPublished=false;
    // }else{
    //     video.isPublished=true;
    // }

    await video.save();

    return res.status(200).json(new ApiResponse(200, toggleStatus, "Status changes successfully"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}