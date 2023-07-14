import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

async function main() {
  // get file list in _source
  const files = fs.readdirSync('./_source');

  // loop files
  for (const _file of files) {
    const _sourceFilename = `./_source/${_file}`;

    // is not file
    if (!fs.statSync(_sourceFilename).isFile()) {
      console.log(`${_sourceFilename} is not a file`);
      continue;
    }

    // is not png
    if (!_file.endsWith('.png')) {
      console.log(`${_sourceFilename} is not a png`);
      continue;
    }

    // get sn
    const snMatched = _file.match(/V1-(\d{4})/);
    if (!snMatched) {
      console.log(`${_sourceFilename}: sn not found`);
      continue;
    }
    const _sn = snMatched[1];

    // load image
    const img = await loadImage(_sourceFilename);

    // create canvas
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, img.width, img.height);

    const buffer = canvas.toBuffer(
      'image/jpeg',
      {
        quality: 0.50,
        progressive: true,
        chromaSubsampling: true,
      },
    );

    const _destFilename = `./_outputs/jpg/${_sn}.jpg`;
    console.log(_destFilename)
    fs.writeFileSync(_destFilename, buffer);
  }
}

main();
