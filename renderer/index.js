const {
	ipcRenderer
} = require('electron');

// 监视 添加音乐 按钮的点击
document.getElementById("add-music-window-button").addEventListener("click", () => {
    ipcRenderer.send("add-music-window-active");
});