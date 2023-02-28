const socket = io();

var currentPath = [""];

var info = {};

var view = "list";

function getFolder() {
  //
  console.log(`requested [${currentPath.join("/")}]`);
  socket.emit("get_folder", currentPath.join("/"));
  document.querySelector("#table").innerHTML = "";
  document.querySelector("#grid").innerHTML = "";

  // update path
  document.querySelector("#path").innerHTML = info.homedir + currentPath.join("/");
  document.querySelector("#loading").style.display = "block";

  // url params

  var newurl =
    window.location.protocol +
    "//" +
    window.location.host +
    window.location.pathname +
    `?path=${currentPath.join("/")}`;
  window.history.pushState({ path: newurl }, "", newurl);
}
socket.on("files", (f) => {
  //
  console.log(`received [${currentPath.join("/")}]:`);

  document.querySelector("#filecount").innerHTML = "~" + f.length + " items";
  document.querySelector("#loading").style.display = "none";

  if (view == "list") showFilesList(f);
  if (view == "grid") showFilesGrid(f);
});

function back() {
  //
  currentPath.pop();
  getFolder();
}

socket.on("info", (d) => {
  info = d;
  console.log(info);
  document.querySelector("#hostname").innerHTML = info.hostname;

  // url params
  let urlParams = new URLSearchParams(window.location.search);
  try {
    currentPath.push(urlParams.get("path").replaceAll("//", "/"));
  } catch {}
  getFolder();
});

function formatBytes(bytes, dm = 2) {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat(bytes / Math.pow(k, i)).toFixed(dm)} ${sizes[i]}`;
}

function changeView(v) {
  view = v;
  getFolder();
}

function createElement(a, b) {
  let elem = document.createElement(a);
  for (i in Object.keys(b)) {
    elem[Object.keys(b)[i]] = b[Object.keys(b)[i]];
  }
  return elem;
}

function showFilesGrid(f) {
  f.forEach((file) => {
    //
    // cancel dotfiles
    if (file.name.startsWith(".")) {
      return;
    }

    let elem = createElement("div", {});
    let filename = createElement("p", { innerHTML: file.name, className: "filename" });

    let file_btime = new Date(file.btime);
    file_btime = `${file_btime.getFullYear()}/${file_btime.getMonth().toString().padStart(2, "0")}/${file_btime
      .getDay()
      .toString()
      .padStart(2, "0")} ${file_btime.getHours().toString().padStart(2, "0")}:${file_btime
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    let btime = createElement("p", { innerHTML: file_btime, className: "btime" });
    let extension = createElement("p", { innerHTML: file.extension, className: "extension" });
    

    if (file.type == "folder") {
      // folder
      elem.onclick = function () {
        currentPath.push(file.name);
        getFolder();
      };

      let icon = createElement("img", { src: "./assets/folder.svg", className: "icon" });

      elem.append(icon, filename, btime);
    } else {
      // file
      let size = createElement("p", { innerHTML: formatBytes(file.size), className: "size" });
      if (file.type == "image") {
        // image
        icon = createElement("img", {
          src: `${file.path}/${file.name}`.replaceAll("#", "%23").replaceAll("\\\\", "\\"),
          className: "icon",
        });
      } else if (file.type == "video") {
        // video
        icon = createElement("video", {
          controls: true,
          src: `${file.path}/${file.name}`.replaceAll("#", "%23").replaceAll("\\\\", "\\") + "#t=0.001",
          className: "icon",
        });
      } else {
        // other file
        icon = createElement("img", { src: "./assets/file.svg", className: "icon" });
      }
      elem.append(icon, filename, btime, extension, size);
    }

    document.querySelector("#grid").append(elem);
  });
}

function showFilesList(f) {
  let tr = createElement("tr", {});
  let th1 = createElement("th", { innerHTML: "" });
  let th2 = createElement("th", { innerHTML: "Name" });
  let th3 = createElement("th", { innerHTML: "Date" });
  let th4 = createElement("th", { innerHTML: "Extension" });
  let th5 = createElement("th", { innerHTML: "Size" });
  tr.append(th1, th2, th3, th4, th5);

  // document.querySelector("#table").append(tr);
  f.forEach((file) => {
    //

    // cancel dotfiles
    if (file.name.startsWith(".")) {
      return;
    }

    // elements
    let elem = createElement("tr", {});
    let filename = createElement("td", { innerHTML: file.name, className: "filename" });

    let file_btime = new Date(file.btime);
    file_btime = `${file_btime.getFullYear()}/${file_btime.getMonth().toString().padStart(2, "0")}/${file_btime
      .getDay()
      .toString()
      .padStart(2, "0")} ${file_btime.getHours().toString().padStart(2, "0")}:${file_btime
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    let btime = createElement("td", { innerHTML: file_btime, className: "btime" });
    let extension = createElement("td", { innerHTML: file.extension, className: "extension" });


    if (file.type == "folder") {
      // folder
      elem.onclick = function () {
        currentPath.push(file.name);
        getFolder();
      };
      let icon_container = createElement("td", { className: "icon-container" });
      let icon = createElement("img", { src: "./assets/folder.svg", className: "icon" });

      icon_container.append(icon);

      elem.append(icon_container, filename, btime);
    } else {
      // file

      let size = createElement("td", { innerHTML: formatBytes(file.size), className: "size" });
      let icon_container = createElement("td", { className: "icon-container" });

      // not a folder
      if (file.type == "image") {
        // image
        icon = createElement("img", {
          src: `${file.path}/${file.name}`.replaceAll("#", "%23").replaceAll("\\\\", "\\"),
          className: "icon",
        });
      } else if (file.type == "video") {
        // video
        icon = createElement("video", {
          controls: true,
          src: `${file.path}/${file.name}`.replaceAll("#", "%23").replaceAll("\\\\", "\\") + "#t=0.001",
          className: "icon",
        });
      } else {
        // other file
        icon = createElement("img", { src: "./assets/file.svg", className: "icon" });
      }
      icon_container.append(icon);
      elem.append(icon_container, filename, btime, extension, size);
    }

    document.querySelector("#table").append(elem);
  });
}
