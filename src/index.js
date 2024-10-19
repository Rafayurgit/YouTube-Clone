//require('dotenv').config({path: './env'})

import dotenv from 'dotenv';
import connectDb from './db/index.js';
import {app} from './app.js'

dotenv.config({
    path:'./env'
})

connectDb()
.then(()=>{
    app.listen(process.env.PORT || 3000, ()=>{
        console.log(`app is listining on ${process.env.PORT}`);
        
    })
})
.catch((error)=>{
    console.log("MongoDb failed to connect", error);

    
})


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