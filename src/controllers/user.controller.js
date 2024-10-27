import {asyncHandler} from "../utils/asyncHandeler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js "
import {uploadOnCloudinary} from"../utils/cloudinary.js ";
import {ApiResponse} from  "../utils/ApiResponse.js" 


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

    const avatarLocalPath= req.files?.avatar[0]?.path;
    //const coverImageLocalPath= req.files?.coverImage[0].path;
    let coverImagePath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0 ){
        coverImagePath=req.files.coverImage[0].path;
    }

    const avatar =await uploadOnCloudinary(avatarLocalPath)
    const coverImage= await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError( 409 ,"Avatar is required");
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

    if(!username || !email){
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

    const logedInUser= await User.findById(user._id).select("-password -refreshToken")

    const options= {
        httpOnly:true,
        secure:true
    }

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
        new ApiResponse(200, {
            user:logedInUser, accessToken, refreshToken
        },"User LoggedIn scuuessFully"
    ));

})

export {registerUser}