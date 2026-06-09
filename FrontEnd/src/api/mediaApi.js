import { adminApi } from "./adminApi.js";

export const mediaApi = {
  uploadProductImage: adminApi.uploadProductImage,
  deleteProductImage: adminApi.deleteProductImage,
  uploadProductVideo: adminApi.uploadProductVideo,
  deleteProductVideo: adminApi.deleteProductVideo,
};
