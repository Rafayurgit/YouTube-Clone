import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    //TODO: create playlist


})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists


})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playList Id");
    }

    const playlist =await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404,"Playlist not found").populate('owner', 'name email');
        
    }
    return res.status(200).json(new ApiResponse(200, playlist, "PlayList fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid PlayList Id or Video Id");
    }

    const playList= await Playlist.findById(playlistId);
    if(!playList){
        throw new ApiError(404,"PlayList not found");   
    }

    if(playList.videos.includes(videoId)){
        throw new ApiError(400,"Video Alredy exist in playList");
    }

    playList.videos.push(videoId);
    await playList.save()

    return res.status(200).json(200, playList, "Successfully added video to playList")

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid PlayList Id or Video Id");
    }

    const playList= await Playlist.findById(playlistId);
    if(!playList){
        throw new ApiError(404,"PlayList not found");
    }

    if(!playList.videos.includes(videoId)){
        throw new ApiError(404,"Video is not present in playlist");
    }

    playList.videos = playList.videos.filter((id)=>id.toString() !== videoId);
    await playList.save();

    return res.status(200).json(new ApiResponse(200, updatedPlayList, "Video removed Successfully"))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid PlayList id");
    }

    const deletedPlaylist =await Playlist.findByIdAndRemove(playlistId)
    if(!deletedPlaylist){
        throw new ApiError(404,"PlayList not found");
    }

    return res.status(200).json(new ApiResponse(200, null, "PlayList deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}