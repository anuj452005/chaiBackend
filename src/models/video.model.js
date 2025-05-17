import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const VideoSchema = new Schema(
  {
     videoFile:{
        type:String, //Cloudinary URL for the video file
        required:true,
     },
     thumbnail:{
        type:String, //Cloudinary URL for the thumbnail image
        required:true,
     },
     title:{
        type:String,
        required:true,
        
     },
     description:{
        type:String,
        required:true,
     },
     duration:{
        type:Number, //In seconds
        required:true,
     },
     views:{
        type:Number,
        default:0,
     },
     isPublished:{
        type:Boolean,
        default:true,
     },
     owner:{
        type:Schema.Types.ObjectId,
        ref:"User", // Reference to the User model
     },

  },{
    timestamps: true,
  }
)

VideoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", VideoSchema);