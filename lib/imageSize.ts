export interface ImageSize {
  width: number;
  height: number;
}

/**
 * Liest die Bildmasse direkt aus dem Datei-Header — ohne zusätzliche
 * Abhängigkeit. Unterstützt PNG, JPEG und WebP; bei allem anderen (z. B. AVIF)
 * wird null zurückgegeben, die Masse sind für den Upload optional.
 */
export function readImageSize(bytes: Uint8Array): ImageSize | null {
  return readPng(bytes) ?? readJpeg(bytes) ?? readWebp(bytes);
}

function toView(bytes: Uint8Array): DataView {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

function readPng(bytes: Uint8Array): ImageSize | null {
  if (bytes.length < 24) return null;
  const isPng =
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (!isPng) return null;

  const view = toView(bytes);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

function readJpeg(bytes: Uint8Array): ImageSize | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;

  const view = toView(bytes);
  let offset = 2;

  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = bytes[offset + 1];
    const length = view.getUint16(offset + 2);

    // SOF0…SOF15 tragen die Bildmasse; SOF4/SOF8/SOF12 sind keine Frame-Header.
    const isStartOfFrame =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;

    if (isStartOfFrame) {
      return { height: view.getUint16(offset + 5), width: view.getUint16(offset + 7) };
    }

    offset += 2 + length;
  }

  return null;
}

function readWebp(bytes: Uint8Array): ImageSize | null {
  if (bytes.length < 30) return null;

  const header = new TextDecoder().decode(bytes.subarray(0, 4));
  const format = new TextDecoder().decode(bytes.subarray(8, 12));
  if (header !== "RIFF" || format !== "WEBP") return null;

  const chunk = new TextDecoder().decode(bytes.subarray(12, 16));
  const view = toView(bytes);

  if (chunk === "VP8X") {
    const width = 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16));
    const height = 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16));
    return { width, height };
  }

  if (chunk === "VP8 ") {
    return {
      width: view.getUint16(26, true) & 0x3fff,
      height: view.getUint16(28, true) & 0x3fff,
    };
  }

  if (chunk === "VP8L") {
    const bits = view.getUint32(21, true);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }

  return null;
}
