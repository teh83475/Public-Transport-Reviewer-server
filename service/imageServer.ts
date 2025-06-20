import { v2 as cloudinary } from 'cloudinary';


export const uploadImage= async (uri) => {
  try {
    cloudinary.config({ 
      cloud_name: '', 
      api_key: '', 
      api_secret: ''
    });
  
    const result = await cloudinary.uploader.upload("data:image/jpg;base64,"+uri);
    console.log(result)
  } catch (error) {
    console.error(error);
  }
  
}