import mongoose from 'mongoose';
import { DB_NAME } from './constants';
import express from 'express';


const app= express();
;( async()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`)
        
        app.on("Error:", (error)=>{
            console.log("ERR:" ,error)
            throw error
        })

        app.listen(process.env.PORT, ()=>{
            console.log(`App is listining on port ${process.env.PORT}`);
            
        })

    }catch(error){
        console.error("ERROR", error )
        throw err
    }
})()