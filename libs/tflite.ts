import { loadTensorflowModel } from "react-native-fast-tflite";
import * as ImageManipulator from 'expo-image-manipulator';
import { toByteArray } from 'base64-js';
import jpeg from 'jpeg-js';

let model: any | null = null;
let loadPromise: Promise<any> | null = null;

export async function ensureModelLoaded() {
  if (model) return model; // ถ้าโหลดเสร็จแล้ว → คืนเลย
  if (!loadPromise) { // ถ้ายังไม่เคยโหลด → เริ่มโหลด
    loadPromise = loadTensorflowModel(
      require("@/assets/models/mobilenetv3.tflite")
    ).then((m) => {
      model = m;
      return model;
    });
  }
  return loadPromise; // ถ้าโหลดอยู่แล้ว คืน promise เดิม
}

export function getModel() {
  if (!model) throw new Error("Model not loaded yet");
  return model;
}


/*
ข้อมูล MobilenetV3
1.Input shape : (1, 224, 224, 3) หรือ (batch=1, height=224, width=224, channels=3)
2.Data type: Float32 (สำหรับโมเดล float) หรือ UInt8 (สำหรับ quantized model)
3.Normalize pixel values ให้อยู่ในช่วง [-1, 1] (ใน model ทำให้อยู่แล้ว)
4.ใช้ RGB channels
*/

export type PreprocessResult = {
  data: Float32Array;            
  shape: readonly [number, number, number, number]; 
  width: number;
  height: number;
};

export async function preprocessImage(
  uri: string,
  targetW = 224,
  targetH = 224
): Promise<PreprocessResult> {
  // 1) Resize และส่งออกเป็น JPEG + base64 (เพื่อให้ถอดเป็น RGBA ได้ด้วย jpeg-js)
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: targetW, height: targetH } }],
    {
      compress: 1,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    }
  );

  console.log('phase 1')

  if (!manipulated.base64) {
    throw new Error('Failed to produce base64 from ImageManipulator');
  }

  // 2) base64 → Uint8Array (บิต JPEG)
  const jpegBytes = toByteArray(manipulated.base64);
  console.log('phase 2')
  // 3) ถอด JPEG → RGBA ด้วย jpeg-js (pure JS, ใช้ได้ใน RN)
  const decoded = jpeg.decode(jpegBytes, { useTArray: true }); // { data: Uint8Array(RGBA), width, height }
  const { data: rgba, width, height } = decoded;
  console.log('phase 3')
  if (width !== targetW || height !== targetH) {
    // ปกติควรได้เท่ากันอยู่แล้ว เพราะเราบังคับ resize ไปแล้ว
    console.warn(`Decoded size ${width}x${height} differs from target ${targetW}x${targetH}`);
  }
  console.log('phase 3')
  // 4) RGBA → RGB (ตัดช่อง A) และแปลงเป็น Float32 0..255
  //    ลำดับช่องของ jpeg-js คือ R,G,B,A ต่อเนื่องกัน
  const N = targetW * targetH;
  const floatRGB = new Float32Array(N * 3);

  let src = 0; // index ใน rgba
  let dst = 0; // index ใน floatRGB
  for (let i = 0; i < N; i++) {
    floatRGB[dst] = rgba[src];     // R
    floatRGB[dst + 1] = rgba[src + 1]; // G
    floatRGB[dst + 2] = rgba[src + 2]; // B
    src += 4; // RGBA
    dst += 3; // RGB
  }
  console.log('phase 4')
  return {
    data: floatRGB,                 
    shape: [1, targetH, targetW, 3],
    width: targetW,
    height: targetH,
  };
}

export function softmax(a: Float32Array) {
  const m = Math.max(...a);
  const exps = a.map(v => Math.exp(v - m));
  const s = exps.reduce((p, c) => p + c, 0);
  return exps.map(v => v / s);
}