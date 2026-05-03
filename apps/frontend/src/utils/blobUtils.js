export async function getImageDimensions(blob) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      resolve({
        largura: img.width,
        altura: img.height
      });
      URL.revokeObjectURL(url);
    };

    img.onerror = reject;
    img.src = url;
  });
}

import fs from "fs";
import path from "path";
import os from "os";

export async function baixarImagem(url) {
  const pastaTmp = os.tmpdir(); // /tmp no Linux/mac

  const nomeArquivo = `img_${Date.now()}.jpg`;
  const caminho = path.join(pastaTmp, nomeArquivo);

  const response = await fetch(url);
  const buffer = await response.arrayBuffer();

  fs.writeFileSync(caminho, Buffer.from(buffer));

  return caminho;
}