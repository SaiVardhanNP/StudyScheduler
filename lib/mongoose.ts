import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const MONGODBURL = process.env.MONGODB_URL;

    if (!MONGODBURL) {
      console.log("No mongodb connection string in the .env file!");
      return;
    }
    const connection = await mongoose.connect(MONGODBURL);

    if(connection){
        console.log("DB Connected!")
    }
  } catch (e) {
    console.log("Failed to connect to the database!");
  }
};

export default connectDB;
