import {asyncHandler} from "../utils/asyncHandeler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js "
import {uploadOnCloudinary} from"../utils/cloudinary.js ";


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

    const existedUser =User.findOne({
        $or:[{username}, {email}]
    })

    if(existedUser){
        throw new ApiError(409, "user with email or username already exist");
        
    }

    const avatarLocalPath= req.files?.avatar[0]?.path;
    const coverImageLocalPath= req.files?.coverImage[0].path;

    const avatar =await uploadOnCloudinary(avatarLocalPath)
    const coverImage= await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError( 409 "Avatar is required");
    }

     const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
    })
})

export {registerUser}