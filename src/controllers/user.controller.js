import {asyncHandler} from "../utils/asyncHandeler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js "
import {uploadOnCloudinary} from"../utils/cloudinary.js ";
import {ApiResponse} from  "../utils/ApiResponse.js" 
import { verifyJWT } from "../middlewares/auth.middleware.js";
import jwt from "jsonwebtoken"



const generateRefreshAndAccessToken =async (userId)=>{
    try {
        const user= await User.findById(userId)
    const accessToken =await user.generateAccessToken();
    const refreshToken= await user.generateRefreshToken();

    user.refreshToken=refreshToken

    await user.save({ValidateBeforeSave: false})
    return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }


}

const registerUser = asyncHandler( async (req, res)=>{
    
    const {fullname, username, email, password}= req.body
    console.log("email:", email);


    if(
        [fullname, username, email, password].some((field)=>
            field?.trim() ===""
        )
    ){
        throw new ApiError(400, "All fields are required");
    }

    const existedUser =await User.findOne({
        $or:[{username}, {email}]
    })

    if(existedUser){
        throw new ApiError(409, "user with email or username already exist");
    }

    console.log('req.files:', req.files);


    const avatarLocalPath= req.files?.avatar[0]?.path;
    //const coverImageLocalPath= req.files?.coverImage[0].path;
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0 ){
        coverImageLocalPath=req.files.coverImage[0].path;
    }

    const avatar =await uploadOnCloudinary(avatarLocalPath)
    const coverImage= await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError( 400 ,"Avatar is required");
    }

     const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage:coverImage?.url || "",
        username:username.toLowerCase(),
        email,
        password,
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    if(!createdUser){
        throw new ApiError(500, "something went wron while registring the user");
        
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})
    
const loginUser= asyncHandler( async (req, res)=>{
    
    const {username, email, password}= req.body

    if(!username && !email){
        throw new ApiError(400,"username or email is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(404,"User does not exist");
    }

    const isPassValid= await user.isPasswordCorrect(password)
    if(!isPassValid){
        throw new ApiError(401, "password is incorrect/ Invalid credentials ");
        
    }

    const {accessToken, refreshToken}=await generateRefreshAndAccessToken(user._id)

    const loggedInUser= await User.findById(user._id).select("-password -refreshToken")

    const options= {
        httpOnly:true,
        secure:true
    }

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
        new ApiResponse(200,
             {
                user:loggedInUser, accessToken, refreshToken
        },
        "User LoggedIn scuuessFully"
    ));



})

const logOutUser = asyncHandler(async(req, res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refeshToken :undefined
            }
        },
        {
            new :true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200,{}, "user logged out "))


})

const refreshAccessToken= asyncHandler( async()=>{
    const incommingRefreshToken = req.cookie.refeshToken || req.body.refeshToken

    if(!incommingRefreshToken){
        throw new ApiError(401, "unauthorized request")
    }

    try {

        const decodedToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user=await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401, "Invalid refresh token")
        }

        if(incommingRefreshToken !== user?.refeshToken){
            throw new ApiError(401, "Refresh token is expired or used");
            
        }

        const options={
            httpOnly:true,
            secure:true
        }

        const {newRefreshToken, accessToken} =await generateRefreshAndAccessToken(user._id)

        return res.status(200).cookie("accessToken",accessToken , options).cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refeshToken: newRefreshToken},
                "Access Token refreshed"
            )
        )

    } catch (error) {
        throw new ApiError(401,error.message|| "Invalid refresh token")
    }
})

const changeCurrentPassword= asyncHandler( async(req,res)=>{
    const {oldPassword, newPassword}= req.body

    const user= await User.findById(req.user?._id)

    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid old password");
    }
    user.password=newPassword
    await user.save({ValidateBeforeSave:false})

    return res.status(200)
    .json(new ApiResponse(200, {}, "password changed successfully"))

})

const getCurrentUser=asyncHandler(async(req, res)=>{
    return res.status(200)
    .json(200, req.user, "current User fetched successfully")
})

const updateAccountDetails= asyncHandler( async(req, res)=>{
    const {email, fullname} = req.body

    if(!fullname || !email){
        throw new ApiError(400,"All fields are required");
    }

    const user= User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname, email:email
            }
        },
        {
            new:true
        }
    ).select("-password")

    return res.status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))

})

const updateUserAvatar= asyncHandler(async (req, res)=>{
    const avatarLocalPath = req.file?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing");
    }

    const avatar= await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url){
        throw new ApiError(400,"Error while uploading avatar");   
    }

    const user= User.findByIdAndUpdate(
        req.body?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {
            new:true
        }
    ).select("-password")

    return res.status(200).json(
        new ApiResponse(200, user, "Avatar image updated")
    )
})

const updateCoverImage= asyncHandler( async(req,res)=>{
    const coverLocalPath=req.file?.path
    if(!coverLocalPath){
        throw new ApiError(400, "CoverImage file is missing")
    }

    const coverImage=await uploadOnCloudinary(coverLocalPath)
    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading coverImage");
    }

    const user= User.findByIdAndUpdate(
        req.body?._id,
        {
            $set:{coverImage:coverImage.url}
        },
        {new:true}
    ).select("-password")

    return res.status(200)
    .json(200, user, "Cover Image updated successfully" )
})

export {registerUser, loginUser, logOutUser, refreshAccessToken,changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateCoverImage }