const {
	app,
	BrowserWindow,
	ipcMain
} = require('electron');

app.on("ready", () => {
	// 定义一个新主窗口，设定宽高
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true
		}
	});

	// 新主窗口加载网页index.html
	mainWindow.loadFile("index.html");

	// 监听message事件
	ipcMain.on("message", (event, args) => {
		// 打印message事件传递的信息
		console.log(args);
		// 回传reply事件（message的发送方监听该事件中）
		mainWindow.send("reply", "Message Received.");
		// 上面的语句等同于 event.sender.send("reply", "Get it.");
	});
});