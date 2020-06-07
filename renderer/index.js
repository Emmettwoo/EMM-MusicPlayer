const {
    ipcRenderer
} = require('electron');
const {
    $
} = require("../utils/DOMUtil.js");
const {trackDurationFormart} = require("../utils/TimeUtil");

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

const renderPlayingSeeker = (seekerTime, trackDuration) => {
    const playingProgress = Math.floor(seekerTime/trackDuration * 100);
    const playingProgressBar = $("playing-progress-bar");
    // playingProgressBar.innerHTML = playingProgress + "%";
    playingProgressBar.style.width = playingProgress + "%";

    const seeker = $("playing-status-seeker");
    seeker.innerHTML = trackDurationFormart(seekerTime);
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
            // 删除的音乐为当前播放曲目，则暂停播放
            if(currentTrack && currentTrack.id === currentTrackId) {
                // todo: 目标歌曲被删除，播放状态栏重置
                musicAudio.pause();
            }
            ipcRenderer.send("tracks-list-delete-button-click", currentTrackId); 
        }
    } else {
        alert("播放音乐时出现错误！");
    }
});

// 音乐播放器 状态监听渲染(初始加载）
musicAudio.addEventListener("loadedmetadata", (event) => {
    renderPlayingStatusHTML(currentTrack.fileName, musicAudio.duration);
});

// 音乐播放器 状态监听渲染（更新时间）
musicAudio.addEventListener("timeupdate", () => {
    renderPlayingSeeker(musicAudio.currentTime, musicAudio.duration);
});

// 监听 渲染列表 事件的通知
ipcRenderer.on("load-music-list", (event, tracks) => {
    allTracks = tracks;
    renderMusicListHTML(allTracks);
});