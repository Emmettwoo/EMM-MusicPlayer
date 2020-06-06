const Store = require('electron-store');
const path = require("path");
const {
    v4: uuidv4
} = require("uuid");

class DataUtil extends Store {

    // 构造时初始化音乐列表
    constructor(settings) {
        super(settings);
        this.tracks = this.getTracks() || [];
    }

    // 持久化当前音乐列表
    saveTracks() {
        this.set("tracks", this.tracks);
        return this;
    }

    // 获取持久化的音乐列表
    getTracks() {
        return this.get("tracks") || []
    }

    // 添加信息到音乐列表（未持久化）
    addTracks(tracksPath) {
        // 冗余地多读取一遍文件数据保证正确性
        this.tracks = this.getTracks() || [];

        // 生成tracks数据（id、路径、文件名）
        const newTracks = tracksPath.map((trackPath) => {
            return {
                id: uuidv4(),
                path: trackPath,
                fileName: path.basename(trackPath)
            }
        })
        // 过滤重复的数据（以路径为依据）
        .filter((newTrack) => {
            const oldTracksPath = this.getTracks().map((oldTrack) => oldTrack.path);
            return oldTracksPath.indexOf(newTrack.path) < 0;
        });
        // 合并（过滤后）数据，并写入文件
        this.tracks = [...this.tracks, ...newTracks];
        return this.saveTracks();
    }
}

module.exports = DataUtil;