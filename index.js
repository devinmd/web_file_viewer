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
const port = 8008;

// read file extensions
var file_extensions = JSON.parse(fs.readFileSync("file_extensions.json"));

// send index.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});

// listen
server.listen(port, () => {
  console.log(`PORT: ${port}`);
});

io.on("connection", (socket) => {
  // connectoin
  console.log(`(${socket.id}) connected`);

  //  disconnect
  socket.on("disconnect", () => {
    console.log(`(${socket.id}) disconnected`);
  });

  socket.on("get_folder", (requested_path) => {
    //
    console.log("user requested folder: " + requested_path);
    requested_path = requested_path.replaceAll(homedir, "");

    try {
      // array of file names
      files = fs.readdirSync(path.join(homedir, requested_path));

      fileobjects = [];

      // for each file
      files.forEach((file) => {
        filepath = path.join(homedir, requested_path, file);
        console.log(path.extname(filepath).replace(".", ""));

        let stats = fs.statSync(filepath);

        let fileobj = {
          name: path.basename(filepath),
          path: path.dirname(filepath),
          extension: path.extname(filepath).replace(".", ""),
          atime: stats.atime,
          mtime: stats.mtime,
          ctime: stats.ctime,
          btime: stats.birthtime,
          // size in bytes
          size: stats.size,
          // folder or file
          type: stats.isDirectory() ? "folder" : stats.isFile() ? "file" : "other",
          // HOW TO PREVIEW/SHOW THE FILE: folder, audio, video, image, text, none
          view_type: stats.isDirectory()
            ? "folder"
            : Object.keys(file_extensions).includes(path.extname(filepath).replace(".", ""))
            ? file_extensions[path.extname(filepath).replace(".", "")].view_type
            : "none",
          // ICON TO USE
          icon: stats.isDirectory()
            ? "folder.svg"
            : Object.keys(file_extensions).includes(path.extname(filepath).replace(".", ""))
            ? file_extensions[path.extname(filepath).replace(".", "")].icon
            : "file.svg",
        };
        console.log(fileobj);
        fileobjects.push(fileobj);
      });

      socket.emit("files", fileobjects);
      socket.emit("current_path", path.join(homedir, requested_path));
      console.log(path.join(homedir, requested_path));
      app.use(express.static(path.join(homedir, requested_path)));
    } catch (err) {
      console.log(err);
      socket.emit("files", "error");
    }
  });
});

// set public
app.use(express.static(path.join(__dirname, "public")));

app.use(express.static('C:/Users/devin/Documents/ShareX/Screenshots/2023-02'));

