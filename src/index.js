//require('dotenv').config({path: './env'})

import dotenv from 'dotenv';
import connectDb from './db/index.js';


dotenv.config({
    path:'./env'
})

connectDb();


// const app= express();
// ;( async()=>{
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        
//         app.on("Error:", (error)=>{
//             console.log("ERR:" ,error)
//             throw error;
//         })

//         app.listen(process.env.PORT , ()=>{
//             console.log(`App is listining on port ${process.env.PORT}`);
            
//         })

//     }catch(error){
//         console.error("ERROR", error )
//         throw error
//     }
// })()