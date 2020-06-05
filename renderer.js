const {
	ipcRenderer
} = require('electron');

window.addEventListener("DOMContentLoaded", () => {
    // DOM内容加载完成后发送message事件
    ipcRenderer.send("message", "Message Sending.");
    // 然后监听reply事件（message事件接收方会回调该事件）
    ipcRenderer.on("reply", (event, args) => {
        // 将reply中的参数输出到html里id为message的标签中。
        document.getElementById("message").innerHTML = args;
    });
});