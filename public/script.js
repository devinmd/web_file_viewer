const socket = io();

current_path = "";

socket.on("current_path", (path) => {
  // update current path
  current_path = path;
  document.querySelector("#path").innerHTML = current_path;
});

socket.on("files", (filelist) => {
  console.log(filelist);
  document.querySelector("#files").innerHTML = "";

  for (let i = 0; i < filelist.length; i++) {
    let file = filelist[i];

    if (!file.name.startsWith(".")) {
      let container = document.createElement("button");
      container.innerHTML = filelist[i].type + " -- " + filelist[i].name;
      console.log(filelist[i])
      container.style.backgroundImage = 'url(./assets/fileicons/' + filelist[i].icon +')'

      if (file.type == "folder") {
        container.onclick = function () {
          getFolder(file.name);
        };
      } else if (file.type == "file") {
        //
      }

      document.querySelector("#files").append(container);
    }
  }
});

function init() {
  getFolder('Documents/programming/html');
}

function getFolder(folder = "") {
  socket.emit("get_folder", current_path + "/" + folder);
}

init();
