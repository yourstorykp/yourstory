import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImageToCloudinary(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "yourstory", // Organize uploads in a folder
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result.secure_url);
        } else {
          reject(new Error("Unknown error uploading to Cloudinary"));
        }
      }
    );

    uploadStream.end(buffer);
  });
}

export async function uploadBase64ToCloudinary(base64String: string): Promise<string> {
  const result = await cloudinary.uploader.upload(base64String, {
    folder: "yourstory",
  });
  return result.secure_url;
}
