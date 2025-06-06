import { v2 as cloudinary } from 'cloudinary';


export const uploadImage= async (uri) => {
  try {
    cloudinary.config({ 
      cloud_name: 'ddbxntn9n', 
      api_key: '538852434275465', 
      api_secret: '_khbdKyrVOr4mxfcM15auiZWrf8'
    });
  
    const result = await cloudinary.uploader.upload("data:image/jpg;base64,"+uri);
    console.log("HIHIHIIHIHIHI")
    console.log(result)
  } catch (error) {
    console.error(error);
  }
  
}