const socket = io();

var currentPath = [""];

var info = {};

var view = "list";

function getFolder() {
  //
  console.log(`requested [${currentPath.join("/")}]`);
  socket.emit("get_folder", currentPath.join("/"));
  document.querySelector("#list").innerHTML = "";
  // update path
  document.querySelector("#path").innerHTML = info.homedir + currentPath.join("/");
  document.querySelector("#loading").style.display = "block";
}

socket.on("files", (f) => {
  //
  console.log(`received [${currentPath.join("/")}]:`);

  console.log(f);

  document.querySelector("#filecount").innerHTML = f.length + " items";
  document.querySelector("#loading").style.display = "none";

  let tr = createElement('tr', {})
  let th1 = createElement('th', {innerHTML: ''})
  let th2 = createElement('th', {innerHTML: 'Name'})
  let th3 = createElement('th', {innerHTML: 'Date'})
  th3.style.width = 0
  let th4 = createElement('th', {innerHTML: 'Size'})
  th4.style.width = 0
tr.append(th1,th2,th3,th4)

  document.querySelector('#list').append(tr)
  f.forEach((file) => {
    //

    // cancel dotfiles
    if (file.name.startsWith(".")) {
      return;
    }

    // elements
    let elem = createElement("tr", {});
    let filename = createElement("td", { innerHTML: file.name, className: 'filename' });

    let file_btime = new Date(file.btime);
    file_btime = `${file_btime.getFullYear()}/${file_btime.getMonth().toString().padStart(2, "0")}/${file_btime
      .getDay()
      .toString()
      .padStart(2, "0")} ${file_btime.getHours().toString().padStart(2, "0")}:${file_btime
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    let btime = createElement("td", { innerHTML: file_btime, className: "btime" });

    if (file.type == "folder") {
      // folder
      elem.onclick = function () {
        currentPath.push(file.name);
        getFolder();
      };
      let icon_container = createElement("td", {className: 'icon-container'});
      let icon = createElement("img", { src: "./assets/folder.svg", className: "icon" });

      icon_container.append(icon);

      elem.append(icon_container, filename, btime);
    } else {
      // file
      elem.className = "file";

      let size = createElement("td", { innerHTML: formatBytes(file.size), className: "size" });
      let icon_container = createElement("td", {className: 'icon-container'});

      // not a folder
      if (file.type == "image") {
        // image
        icon = createElement("img", { src: `${file.path}/${file.name}`.replaceAll("#", "%23"), className: "icon" });
        console.log(file);
      } else if (file.type == "video") {
        // video
        icon = createElement("video", {
          controls: true,
          src: `${file.path}/${file.name}`.replaceAll("#", "%23") + "#t=0.001",
          className: "icon",
        });
      } else {
        // other file
        icon = createElement("img", { src: "./assets/file.svg", className: "icon" });
      }
      icon_container.append(icon);
      elem.append(icon_container, filename, btime, size);
    }

    document.querySelector("#list").append(elem);
  });
});

function back() {
  //
  currentPath.pop();
  getFolder();
}

socket.on("info", (d) => {
  info = d;
  console.log(info);
  changeView("list");
  document.querySelector("#hostname").innerHTML = info.hostname;
  getFolder();
});

function formatBytes(bytes, dm = 2) {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i))).toFixed(dm)} ${sizes[i]}`;
}

function changeView(v) {
  document.querySelector("#list").setAttribute("view", v);
}

function createElement(a, b) {
  let elem = document.createElement(a);
  for (i in Object.keys(b)) {
    elem[Object.keys(b)[i]] = b[Object.keys(b)[i]];
  }
  return elem;
}
