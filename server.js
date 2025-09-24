// 文件名: server.js
// 状态：最终版 + 文件上传功能 (已修正中间件顺序)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import multer from 'multer';

// --- 基础设置 ---
const app = express();
const PORT = 3000;

// --- 获取当前文件目录 ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 中间件设置 (第1部分) ---
app.use(cors());

// ===================================================================
//  ✅ 修正点：将文件上传相关的路由和设置放在 express.json() 之前
// ===================================================================
// 步骤：1、在后端项目server.js文件下npm install multer 安装 multer 包 
// 步骤2、根目录下的终端执行 node server.js
// 配置 multer
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
}
const upload = multer({ dest: UPLOAD_DIR });

// 文件上传 API 路由
// 这个路由现在会优先于 express.json() 被匹配到
app.post('/api/upload', upload.single('file'), (req, res) => {
    console.log('收到文件上传请求...');
    if (!req.file) {
        console.error('[!] 上传失败：请求中未包含文件。');
        return res.status(400).json({ success: false, message: '没有文件被上传。' });
    }
    console.log('✅ 文件上传成功！文件信息:', req.file);
    const fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    res.status(200).json({
        success: true,
        message: '文件上传成功！',
        url: fileUrl
    });
});

// 静态文件服务
app.use('/uploads', express.static(UPLOAD_DIR));


// ===================================================================
//  现在，我们可以安全地使用全局 JSON 解析中间件了
//  因为它不会再干扰到上面的文件上传路由
// ===================================================================
app.use(express.json());


// --- 你的原始 API 路由 (无需改动) ---

// 更新指定 ID 的数据状态
app.patch('/api/data/:id', (req, res) => {
    // ... 你的代码 ...
    const { id } = req.params;
    const { status } = req.body;
    console.log(`收到更新请求：将 ID 为 ${id} 的项目状态更新为 "${status}"`);
    const outputPath = path.join(__dirname, './db/index.json');
    try {
        if (!fs.existsSync(outputPath)) {
            return res.status(404).json({ success: false, message: '数据文件不存在。' });
        }
        const fileContent = fs.readFileSync(outputPath, 'utf8');
        const jsonData = JSON.parse(fileContent);
        const itemIndex = jsonData.data.findIndex(item => item.id === id);
        if (itemIndex === -1) {
            console.error(`[!] 更新失败：未找到 ID 为 ${id} 的项目。`);
            return res.status(404).json({ success: false, message: `未找到 ID 为 ${id} 的项目。` });
        }
        jsonData.data[itemIndex].status = status;
        console.log(`成功找到项目，正在更新其状态...`);
        fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2), 'utf8');
        console.log(`✅ ID ${id} 的项目状态更新成功！`);
        res.status(200).json({ success: true, data: jsonData.data[itemIndex] });
    } catch (error) {
        console.error('[严重错误] 更新数据文件时发生异常:', error);
        res.status(500).json({ success: false, message: '服务器更新数据时发生错误。' });
    }
});

// 添加新数据 (从文本)
app.post('/api/add-data', (req, res) => {
    // ... 你的代码 ...
    const inputText = req.body.text;
    if (!inputText) {
        return res.status(400).json({ success: false, message: '未收到任何文本数据' });
    }
    const outputFilename = './db/index.json';
    const outputPath = path.join(__dirname, outputFilename);
    const outputDirPath = path.dirname(outputPath);
    try {
        const originalFileExists = fs.existsSync(outputPath);
        let existingData = [];
        let lastId = 0;
        if (originalFileExists) {
            console.log(`正在读取现有文件: "${outputPath}"`);
            const existingFileContent = fs.readFileSync(outputPath, 'utf8');
            if (existingFileContent.trim()) {
                const existingJson = JSON.parse(existingFileContent);
                if (Array.isArray(existingJson.data)) {
                    existingData = existingJson.data;
                    if (existingData.length > 0) {
                        const ids = existingData.map(item => parseInt(item.id, 10)).filter(id => !isNaN(id));
                        if (ids.length > 0) {
                            lastId = Math.max(...ids);
                        }
                    }
                    console.log(`成功读取到 ${existingData.length} 条现有记录。当前最大ID为: ${lastId}`);
                }
            }
        } else {
            console.log(`未找到现有的 "${outputPath}" 文件，将创建新文件。`);
        }
        const existingUsersSet = new Set(existingData.map(item => item.user));
        const lines = inputText.split('\n');
        const newData = [];
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.length === 0) continue;
            const parts = trimmedLine.split('|');
            if (parts.length === 5) {
                const user = `user${parts[0]}`;
                if (!existingUsersSet.has(user)) {
                    newData.push({id: "", status: "0", time: "", user: user, password: parts[1], email: parts[2], emailPwd: parts[3], country: parts[4]});
                    existingUsersSet.add(user);
                }
            } else {
                 console.warn(`[!] 已跳过格式错误的行: ${trimmedLine}`);
            }
        }
        if (newData.length > 0) {
            console.log(`发现 ${newData.length} 条新记录，正在进行添加...`);
            let idCounter = lastId + 1;
            const processedNewData = newData.map(item => ({ ...item, id: String(idCounter++) }));
            const combinedData = [...existingData, ...processedNewData];
            const finalOutputObject = { data: combinedData };
            const jsonOutput = JSON.stringify(finalOutputObject, null, 2);
            if (!fs.existsSync(outputDirPath)) {
                fs.mkdirSync(outputDirPath, { recursive: true });
                console.log(`已自动创建输出目录: ${outputDirPath}`);
            }
            fs.writeFileSync(outputPath, jsonOutput, 'utf8');
            const successMessage = `成功添加 ${newData.length} 条新记录。文件现在总共包含 ${combinedData.length} 条记录。`;
            console.log(successMessage);
            return res.status(200).json({ success: true, message: successMessage });
        } else {
            const noChangeMessage = '没有发现需要添加的新记录（可能格式错误或已存在），文件未改变。';
            console.log(noChangeMessage);
            return res.status(200).json({ success: true, message: noChangeMessage });
        }
    } catch (error) {
        console.error('[严重错误] 处理文件时发生异常:', error);
        return res.status(500).json({ success: false, message: '服务器处理文件时发生错误。' });
    }
});


// --- 启动服务器 ---
app.listen(PORT, () => {
    console.log(`后端服务已启动，正在监听 http://localhost:${PORT}`);
});

