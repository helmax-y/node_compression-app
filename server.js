import http from 'http';
import fs from 'fs';
import zlib from 'zlib';
import formidable from 'formidable';
import { pipeline } from 'stream';

http.createServer((req, res) => {
  if (req.url === '/') {
    fs.readFile('./src/index.html', (_, data) => {
      res.end(data);
    });

    return;
  }

  if (req.url === '/file') {
    const form = new formidable.IncomingForm();

    form.parse(req, (error, _, files) => {
      if (error) {
        res.statusCode = 500;
        res.end(String(error));

        return;
      }

      const originalFilename = files.file.originalFilename;
      const userFile = fs.createReadStream(files.file.filepath);
      const gzip = zlib.createGzip();

      pipeline(userFile, gzip, res, (pipelineError) => {
        if (pipelineError) {
          res.statusCode = 500;
          res.end(String(error));
        }
      });

      res.setHeader('Content-Encoding', 'gzip');

      res.setHeader(
        'Content-Disposition', `attachment; filename=${originalFilename}`
      );

      res.statusCode = 200;
    });

    return;
  }

  res.end();
}).listen(3000);
