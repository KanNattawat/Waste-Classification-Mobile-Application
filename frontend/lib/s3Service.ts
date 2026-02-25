import axios from 'axios';
import { API_URL } from "@/config";
import * as FileSystem from "expo-file-system";

export const getS3UploadPresinged = async (userId: string | null, contentType: string) => {
    const res = await axios.post(`${API_URL}/s3-uploadpresigned`, {
        userId: userId,
        contentType: contentType
    })

    const { url, key } = res.data
    return { url, key }
}


export const uploadToS3 = async ( presignedUrl:string, fileUri:string, contentType:string) => {
    const res = await FileSystem.uploadAsync(presignedUrl, fileUri, {
        httpMethod: "PUT",
        headers: {
            "Content-Type": contentType,
        },
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    });

    if (res.status !== 200 && res.status !== 204) {
        throw new Error(`S3 upload failed: ${res.status} ${res.body}`);
    }
}


export const getImage = (url:string|undefined)=>{
    return `https://s3-wasteclassification-project.s3.ap-southeast-7.amazonaws.com/${url}`
}