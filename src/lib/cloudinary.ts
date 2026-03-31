import { createHash } from "crypto";

const DEFAULT_CLOUDINARY_FOLDER = "circl/posts";

const getRequiredEnv = (name: string) => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
};

export const getCloudinaryUploadConfig = () => {
  return {
    cloudName: getRequiredEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"),
    apiKey: getRequiredEnv("CLOUDINARY_API_KEY"),
    folder: process.env.CLOUDINARY_UPLOAD_FOLDER?.trim() || DEFAULT_CLOUDINARY_FOLDER,
  };
};

export const createCloudinarySignature = (params: Record<string, string | number>) => {
  const apiSecret = getRequiredEnv("CLOUDINARY_API_SECRET");

  const signaturePayload = Object.entries(params)
    .filter(([, value]) => value !== "")
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1").update(`${signaturePayload}${apiSecret}`).digest("hex");
};
