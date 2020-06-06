const {
    ipcRenderer
} = require('electron');
const {
    $
} = require("../utils/DOMUtil.js");

let musicAudio = new Audio();
let allTracks, currentTrack;

// 渲染主窗口的播放列表信息
const renderMusicListHTML = (tracks) => {
    const tracksList = $("tracks-list-wrap");
    const tracksListHTML = tracks.reduce((html, track) => {
        html +=
            `<li class="tracks-list list-group-item d-flex justify-content-between align-items-center">
                <div class="col-10">
                    <i class="fa fa-music mr-3 text-secondary"></i>
                    <b>${track.fileName}</b>
                </div> 
                <div class="music-control-button col-2">
                    <i class="fa fa-play mr-3" data-id="${track.id}"></i>
                    <i class="fa fa-trash" data-id="${track.id}"></i>
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

// 监听播放列表页面的按钮点击
$("tracks-list-wrap").addEventListener("click", (event) => {
    event.preventDefault();
    const { dataset, classList } = event.target;
    const currentTrackId = dataset && dataset.id;

    // 获取到了id，并且点击的是play按钮
    if(currentTrackId !== null) {
        if(classList.contains("fa-play")) {
            // 目标id和当前id相同时直接续播，否则设定新目标
            if(currentTrack && currentTrack.id === currentTrackId) {
                musicAudio.play();
            } else {
                // 获取到id对应的track，并播放其path对应的文件
                currentTrack = allTracks.find((track) => track.id === currentTrackId);
                musicAudio.src = currentTrack.path;
                musicAudio.play();

                // 搜索列表里的暂停按钮，重置为播放按钮
                const resetPauseIcon = document.querySelector(".fa-pause");
                if(resetPauseIcon) {
                    resetPauseIcon.classList.replace("fa-pause", "fa-play");
                }
            }
            // 音乐开始播放，原播放图形替换为暂停
            classList.replace("fa-play", "fa-pause");
        } else if(classList.contains("fa-pause")) {
            musicAudio.pause();
            // 音乐暂停播放，原播放图形替换为暂停
            classList.replace("fa-pause", "fa-play");
        } else if(classList.contains("fa-trash") && confirm("确认从播放列表移除？")) {
            ipcRenderer.send("tracks-list-delete-button-click", currentTrackId);
        }
    } else {
        alert("播放音乐时出现错误！");
    }
});

// 监听 渲染列表 事件的通知
ipcRenderer.on("load-music-list", (event, tracks) => {
    // fixme: 会重置 播放按钮 的替换状态
    allTracks = tracks;
    renderMusicListHTML(allTracks);
});