const {
    ipcRenderer
} = require('electron');
const {
    $
} = require("../utils/DOMUtil.js");

const renderMusicListHTML = (tracks) => {
    const tracksList = $("tracks-list-wrap");
    const tracksListHTML = tracks.reduce((html, track) => {
        html +=
            `<li class="tarcks-list list-group-item d-flex justify-content-between align-items-center">
                <div class="col-10">
                    <i class="fa fa-music mr-3 text-secondary"></i>
                    <b>${track.fileName}</b>
                </div> 
                <div class="col-2">
                    <i class="fa fa-play mr-3"></i>
                    <i class="fa fa-trash"></i>
                </div>
            </li>`;
        return html;
    }, "");
    const emptyTrackHTML = `<div class="alert alert-primary">播放列表为空</div>`
    tracksList.innerHTML = tracks.length ? `<ul class="list-group">${tracksListHTML}</ul>` : emptyTrackHTML;
}


// 监听 添加音乐 按钮的点击
$("add-music-window-button").addEventListener("click", () => {
    ipcRenderer.send("add-music-window-button-click");
});

ipcRenderer.on("load-music-list", (event, tracks) => {
    renderMusicListHTML(tracks);
})