import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { DEFAULT_USER_AVATAR } from "../constants";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cleanupFiles = async () => {
  const files = fs.readdirSync("./public/temp");
  files.forEach((file) => {
    if (file !== ".gitkeep") {
      fs.unlinkSync(`./public/temp/${file}`);
      console.log(file, "deleted");
    }
  });
};

const uploadToCloudinary = async (localFilePath: string) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || "project-store",
    });

    fs.unlinkSync(localFilePath);

    return response;
  } catch (err) {
    console.log("Error occured while uploading to cloudinary\n", err);
    fs.unlinkSync(localFilePath);
  }
};

const deleteFromCloudinary = async (cloudFileLink: string) => {
  try {
    if (!cloudFileLink) return null;

    // do not delete if default
    if (cloudFileLink === DEFAULT_USER_AVATAR) {
      return true;
    }

    const urlArray = cloudFileLink.split("/");
    const idx = urlArray.indexOf("project-store");
    const publicId = urlArray
      .slice(idx, urlArray.length)
      .join("/")
      .split(".")[0];

    const response = await cloudinary.uploader.destroy(publicId);

    if (response?.result === "ok") return true;
  } catch (err) {
    console.log("Error occured while deleting from cloudinary\n", err);
    return false;
  }
};

export { uploadToCloudinary, deleteFromCloudinary, cleanupFiles };
