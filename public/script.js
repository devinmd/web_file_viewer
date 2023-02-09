const socket = io();

current_path = "";

path_history = [""];

hideDotFiles = true;


socket.on("current_path", (path) => {
  // update current path
  current_path = path;
  document.querySelector("#path").innerHTML = current_path;
});

function back() {
  getFolder(path_history[path_history.length - 1]);
  path_history.pop();
}

socket.on("hostname", (n) => {
  document.querySelector('#hostname').innerHTML = n
})

socket.on("files", (filelist) => {
  console.log(filelist);
  document.querySelector("#files").innerHTML = "";

  for (let i = 0; i < filelist.length; i++) {
    let file = filelist[i];

    if ((!file.name.startsWith(".") && hideDotFiles) || !hideDotFiles) {
      let container = document.createElement("button");
      container.innerHTML = filelist[i].name;
      console.log(filelist[i]);
      container.style.backgroundImage = "url(./assets/fileicons/" + filelist[i].icon + ")";
      if (file.name.startsWith(".")) {
        container.classList.add("dotfile");
      }

      document.querySelector("#files").append(container);

      if (file.type == "folder") {
        container.onclick = function () {
          getFolder(current_path + "/" + file.name);
          path_history.push(current_path);
        };
      } else if (file.type == "file") {
        //
        if (file.view_type == "image") {
          let imageIcon = document.createElement("img");
          imageIcon.src = file.path + "/" + file.name;
          document.querySelector("#files").append(imageIcon);
        }

        if (file.view_type == "text") {
          // depracated
          let text = document.createElement("plaintext");
          text.innerHTML = file.text;
          document.querySelector("#files").append(text);
          text.style.display='none'
          container.onclick = function () {
            text.style.display = text.style.display == 'none' ? 'block' : 'none';
          };
        }
      }
    }
  }
});

function init() {
  getFolder("");
}

function getFolder(folder = "") {
  socket.emit("get_folder", folder);
}

function refreshFiles() {
  getFolder(current_path);
}
function toggleDotfiles(btn) {
  hideDotFiles = !hideDotFiles;
  btn.innerHTML = (hideDotFiles ? "Show" : "Hide") + " Dotfiles";
  refreshFiles();
}

function home() {
  socket.emit("get_folder", "");
}

init();
