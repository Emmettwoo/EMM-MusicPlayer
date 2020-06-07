const {
    ipcRenderer
} = require('electron');
const {
    $
} = require("../utils/DOMUtil.js");
const {
    trackDurationFormart
} = require("../utils/TimeUtil");
const path = require("path");

let trackAudio = new Audio();
let tracksPath = [];
let allTracks, currentTrack;

// 播放列表 渲染信息
const renderTrackListHTML = (tracks) => {
    const tracksList = $("tracks-list-wrap");
    const tracksListHTML = tracks.reduce((html, track) => {
        html +=
            `<li class="tracks-list list-group-item d-flex justify-content-between align-items-center">
                <div class="col-10">
                    <i class="fa fa-music mr-3 text-secondary"></i>
                    <b>${track.fileName}</b>
                </div> 
                <div class="track-control-button col-2">
                    
                    ${(currentTrack && track.id === currentTrack.id) ? 
                        `<i class="fa fa-pause mr-3" data-id="${track.id}"></i>` :
                        `<i class="fa fa-play mr-3" data-id="${track.id}"></i>`
                    }

                    <i class="fa fa-trash" data-id="${track.id}"></i>
                </div>
            </li>`;
        return html;
    }, "");
    const emptyTrackHTML = `<div class="alert alert-primary">播放列表为空</div>`;

    tracksList.innerHTML = tracks.length ? `<ul class="list-group">${tracksListHTML}</ul>` : emptyTrackHTML;
}

// 播放状态 渲染信息
const renderPlayingStatusHTML = (trackName, trackDuration) => {
    const playingStatus = $("playing-status");
    const playingStatusHTML =
        `<div class="font-weight-bold">
        正在播放：${trackName}
    </div>
    <div class="palying-duration">
        <span id="playing-status-seeker">00 : 00</span> / ${trackDurationFormart(trackDuration)}
    </div>`;
    playingStatus.innerHTML = playingStatusHTML;
}

// 播放进度 渲染信息
const renderPlayingSeeker = (seekerTime, trackDuration) => {
    const playingProgress = Math.floor(seekerTime / trackDuration * 100);
    const playingProgressBar = $("playing-progress-bar");
    // playingProgressBar.innerHTML = playingProgress + "%";
    playingProgressBar.style.width = playingProgress + "%";

    const seeker = $("playing-status-seeker");
    seeker.innerHTML = trackDurationFormart(seekerTime);
}


// 添加音乐 按钮点击
$("add-track").addEventListener("click", () => {
    ipcRenderer.send("add-track-click");
});

// 添加音乐 选择完成
ipcRenderer.on("add-track-done", (event, newTracksPath) => {
    if (Array.isArray(newTracksPath)) {
        tracksPath = newTracksPath;
    }
    ipcRenderer.send("add-track-save", tracksPath);
});

// 播放列表 若干按钮点击
$("tracks-list-wrap").addEventListener("click", (event) => {
    event.preventDefault();
    const {
        dataset,
        classList
    } = event.target;
    const currentTrackId = dataset && dataset.id;

    // 获取到了id，并且点击的是play按钮
    if (currentTrackId !== null) {
        if (classList.contains("fa-play")) {
            // 目标id和当前id相同时直接续播，否则设定新目标
            if (currentTrack && currentTrack.id === currentTrackId) {
                trackAudio.play();
            } else {
                // 获取到id对应的track，并播放其path对应的文件
                currentTrack = allTracks.find((track) => track.id === currentTrackId);
                trackAudio.src = currentTrack.path;
                trackAudio.play();

                // 搜索列表里的暂停按钮，重置为播放按钮
                const resetPauseIcon = document.querySelector(".fa-pause");
                if (resetPauseIcon) {
                    resetPauseIcon.classList.replace("fa-pause", "fa-play");
                }
            }
            // 音乐开始播放，原播放图形替换为暂停
            classList.replace("fa-play", "fa-pause");
        } else if (classList.contains("fa-pause")) {
            trackAudio.pause();
            // 音乐暂停播放，原播放图形替换为暂停
            classList.replace("fa-pause", "fa-play");
        } else if (classList.contains("fa-trash") && confirm("确认从播放列表移除？")) {
            // 删除的音乐为当前播放曲目，则暂停播放
            if (currentTrack && currentTrack.id === currentTrackId) {
                // todo: 目标歌曲被删除，播放状态栏重置
                trackAudio.pause();
            }
            ipcRenderer.send("tracks-list-delete-button-click", currentTrackId);
        }
    } else {
        alert("播放音乐时出现错误！");
    }
});

// 音乐播放器 状态监听渲染(初始加载）
trackAudio.addEventListener("loadedmetadata", (event) => {
    renderPlayingStatusHTML(currentTrack.fileName, trackAudio.duration);
});

// 音乐播放器 状态监听渲染（更新时间）
trackAudio.addEventListener("timeupdate", () => {
    // todo: 支持点击跳转到目标进度
    renderPlayingSeeker(trackAudio.currentTime, trackAudio.duration);
});

// 播放列表 渲染监听
ipcRenderer.on("load-track-list", (event, tracks) => {
    allTracks = tracks;
    renderTrackListHTML(allTracks);
});