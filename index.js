// server
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// other
const fs = require("fs");
const os = require("os");
const path = require("path");

// const vars
const homedir = os.homedir();
const hostname = os.hostname();
const port = 8080;

// send index.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});

// listen
server.listen(port, () => {
  console.log(`Port ${port} from ${__dirname}`);
});

io.on("connection", (socket) => {
  console.log(`(${socket.id}) connected`);
  socket.emit("info", { hostname: hostname, homedir: homedir });
  socket.on("disconnect", () => {
    console.log(`(${socket.id}) disconnected`);
  });

  socket.on("get_folder", (requested_path) => {
    //
    console.log(`(${socket.id}) requested [${path.join(homedir, requested_path)}]`);
    requested_path = requested_path.replaceAll(homedir, "");

    try {
      // array of file names
      let files = fs.readdirSync(path.join(homedir, requested_path));

      let fileobjects = [];

      // for each file
      files.forEach((file) => {
        let filepath = path.join(requested_path, file);

        let stats = fs.statSync(path.join(homedir, filepath));
        let ext = path.extname(filepath).toLowerCase();

        fileobjects.push({
          name: path.basename(filepath),
          path: path.dirname(filepath),
          extension: ext,
          atime: stats.atime,
          mtime: stats.mtime,
          ctime: stats.ctime,
          btime: stats.birthtime,
          // size in bytes
          size: stats.size,
          // folder or file
          type: stats.isDirectory()
            ? "folder"
            : ext == ".mp4" || ext == ".mov" || ext == ".webm"
            ? "video"
            : ext == ".png" ||
              ext == ".jpeg" ||
              ext == ".jpg" ||
              ext == ".svg" ||
              ext == ".gif" ||
              ext == ".webp" ||
              ext == ".avif"
            ? "image"
            : ext == ".wav" || ext == ".mp3"
            ? "audio"
            : "other",
        });
      });

      socket.emit("files", fileobjects);
    } catch (err) {
      console.log(err);
      socket.emit("files", "error");
    }
  });
});

// set public
app.use(express.static(path.join(__dirname, "../../../../")));
app.use(express.static(path.join(__dirname, "public")));
