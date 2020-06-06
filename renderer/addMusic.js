const {
	ipcRenderer
} = require('electron');
const {$} = require("../utils/DOMUtil.js");
const path = require("path");

let tracksPath = [];

// 渲染选择好的音乐添加列表
const renderAddMusicListHTML = (target) => {
    const addMusicList = $("add-music-list");
    const musicItemsHTML = target.reduce((html, music) => {
        html += `<li class="list-group-item">${path.basename(music)}</li>`
        return html;
    }, "");
    addMusicList.innerHTML = `<ul class="list-group">${musicItemsHTML}</ul>`
};



// 监听 添加音乐 按钮的点击
$("add-music-select-button").addEventListener("click", () => {
    ipcRenderer.send("add-music-select-button-click");
});

// 监听文件选择成功的回调
ipcRenderer.on("add-music-select-button-done", (event, newTracksPath) => {
    if(Array.isArray(newTracksPath)) {
        tracksPath = newTracksPath;
        renderAddMusicListHTML(tracksPath);
    }
});

// 监听 保存列表 按钮的点击
$("add-music-save-button").addEventListener("click", () => {
    ipcRenderer.send("add-music-save-button-click", tracksPath);
});