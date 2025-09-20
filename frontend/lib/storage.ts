import * as FileSystem from 'expo-file-system';

export const saveImage = async (localUri: string, uid: string|null, imgid: string) => {
  const fileName = `${uid}_${imgid}.jpg`;

  const newPath = `${FileSystem.documentDirectory}${fileName}`;

  await FileSystem.copyAsync({ from: localUri, to: newPath });

  return newPath;
};

//file:///data/.../ExperienceData/<app-id>/files/123_456.jpg


export async function readImage(uid: string | number, imgid: string | number, ext = "jpg") {
  const filename = `${uid}_${imgid}.${ext}`;
  const path = `${FileSystem.documentDirectory}${filename}`;

  const info = await FileSystem.getInfoAsync(path);
  if (info.exists) {
    return info.uri;     
  }
  throw new Error("File not found: " + path);
}