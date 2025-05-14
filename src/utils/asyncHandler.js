// const asyncHandler=(fn)=>async(req,res)=>{
//     try{
//         await fn(req,res,next);
//     }
//     catch(error){
//         res.status(error.code || 500).json({
//             success:false,
//             message:error.message,
//         });
//     }
// }

// do this usign the proimises

const asyncHandler=(fn)=>async(req,res,next)=>{
    Promise.resolve(fn(req,res,next)).catch((err)=>next(err));
}
export {asyncHandler}