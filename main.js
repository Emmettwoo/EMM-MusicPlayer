const {
	app,
	BrowserWindow,
	ipcMain
} = require('electron');

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
		const finalConfig = {...defaultConfig, ...config};
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

	// 添加音乐 窗口调用监听事件
	ipcMain.on("add-music-window-active", (event, args) => {
		const addMusicWindow = new 	AppWindows({
			width: 500,
			height: 400,
			parent: mainWindow
		}, "./renderer/addMusic.html");
	});
});