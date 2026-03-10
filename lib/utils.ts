import UPNG from "upng-js";
import jsQR from "jsqr";

export const decodeQR = async (arrayBuffer: ArrayBuffer): Promise<string> => {
  const img = UPNG.decode(arrayBuffer);
  const rgbaData = UPNG.toRGBA8(img)[0];

  const code = jsQR(new Uint8ClampedArray(rgbaData), img.width, img.height);
  if (code) {
    return code.data;
  } else {
    console.debug("⚠️ QR-code wasnt defined.");
    return null;
  }
};
