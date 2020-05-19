import yauzl from "yauzl";
import path from "path";
import paths from "../../helpers/paths";
import fs from "fs";
import App from "../../app";
import mkdirp from "mkdirp";
import * as Classes from "../../classes";

let assetDir = path.resolve("./");

if (process.env.NODE_ENV === "production") {
  assetDir = paths.userData;
}

function streamToString(stream, cb) {
  const chunks = [];
  stream.on("data", chunk => {
    chunks.push(chunk.toString());
  });
  stream.on("end", () => {
    cb(chunks.join(""));
  });
}
const regexPath = /[^\\]*\.(\w+)$/;

export default function ImportTacticalMap(filepath, cb) {
  console.info("Importing tactical map");
  yauzl.open(filepath, {lazyEntries: true}, function (err, importZip) {
    if (err) throw err;
    importZip.on("close", function () {
      cb(null);
    });
    importZip.readEntry();

    importZip.on("entry", function (entry) {
      if (/^tacticalMap\/assets/.test(entry.fileName)) {
        console.info("Copying file", entry.fileName);
        // It's an asset. Load it
        importZip.openReadStream(entry, function (error, readStream) {
          if (error) throw error;
          readStream.on("end", function () {
            importZip.readEntry();
          });
          let filename = entry.fileName.replace("tacticalMap/", "");
          if (
            filename
              .split("/")
              [filename.split("/").length - 1].indexOf("default") > -1
          ) {
            const [, ext] = filename.match(regexPath);
            const pathList = filename.split("/");
            filename =
              pathList.slice(0, pathList.length - 1).join("/") + "." + ext;
          }
          const directorypath = filename
            .split("/")
            .splice(0, filename.split("/").length - 1)
            .join("/");

          mkdirp.sync(`${assetDir}/${directorypath}`);
          readStream.pipe(fs.createWriteStream(`${assetDir}/${filename}`));
        });
      }

      if (/tacticalMap\/tacticalMap.json/.test(entry.fileName)) {
        // Mission
        importZip.openReadStream(entry, function (error, readStream) {
          if (error) throw error;
          streamToString(readStream, str => {
            const map = JSON.parse(str);
            if (App.tacticalMaps.find(t => t.id === map.id)) {
              App.tacticalMaps = App.tacticalMaps.filter(t => t.id !== map.id);
            }
            App.tacticalMaps.push(new Classes.TacticalMap(map));
            importZip.readEntry();
          });
        });
      }
    });
  });
}
