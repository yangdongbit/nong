const express = require('express')
const app = express()

app.use('yang', express.static('img')); // 'public'目录下的文件将作为静态资源被托管

app.get('/yang/*', (req, res) => {
    const path = req.params[0];
    const decodedPath = decodeURIComponent(path);
    res.sendFile(decodedPath, { root: __dirname });
});  

app.listen(3000, () => console.log('服务器运行在 http://localhost:3000'));
