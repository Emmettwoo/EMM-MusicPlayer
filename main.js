const {
	app,
	BrowserWindow,
	ipcMain,
	dialog
} = require('electron');
const DataUtil = require("./utils/DataUtil");
const dataUtil = new DataUtil({
	name: "data"
});

// 封装一个窗口初始化类（带默认参数）
class AppWindows extends BrowserWindow {
	constructor(config, userInterface) {
		// 默认的窗口参数配置（宽高设置 及node支持）
		const defaultConfig = {
			width: 800,
			height: 600,
			webPreferences: {
				nodeIntegration: true
			}
		};
		// 传入配置覆盖默认配置（二选一）
		// const finalConfig = Object.assign(defaultConfig, config);
		const finalConfig = {
			...defaultConfig,
			...config
		};
		super(finalConfig);

		// 窗口载入指定的UI内容并渲染显示
		this.loadFile(userInterface);
		this.once("ready-to-show", () => {
			this.show();
		});
	};
}

app.on("ready", () => {
	const mainWindow = new AppWindows({}, "./renderer/index.html");
	mainWindow.webContents.on("did-finish-load", () => {
		mainWindow.send("load-track-list", dataUtil.getTracks());
	});

	// 选择音乐功能 按钮调用事件
	ipcMain.on("add-track-click", (event) => {
		dialog.showOpenDialog({
			properties: ["openFile", "multiSelections"],
			filters: [{
				name: "Music",
				extensions: ["mp3"]
			}]
		}).then((files) => {
			if (files) {
				event.sender.send("add-track-done", files.filePaths);
			}
		}).catch((err) => {
			console.log(err);
		});
	});

	// 保存列表功能 按钮调用事件
	ipcMain.on("add-track-save", (event, tracksPath) => {
		mainWindow.send("load-track-list", dataUtil.addTracks(tracksPath).getTracks());
	});

	// 主窗口音乐列表 删除音乐 按钮调用事件
	ipcMain.on("tracks-list-delete-button-click", (event, trackId) => {
		mainWindow.send("load-track-list", dataUtil.deleteTrack(trackId).getTracks());
	});
});