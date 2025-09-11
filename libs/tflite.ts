// modelService.ts
import { loadTensorflowModel } from 'react-native-fast-tflite';

let model: any | null = null;

export async function ensureModelLoaded() {
  if (!model) {
    model = await loadTensorflowModel(require('@/assets/models/mobilenetv3.tflite'));
  }
  return model!;
}

export function getModel() {
  if (!model) throw new Error('Model not loaded yet');
  return model;
}
