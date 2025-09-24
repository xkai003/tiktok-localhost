import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- 获取当前文件目录 ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- ⚙️ 配置区域 ---
const inputFilename = 'account-data.txt';
const outputFilename = '../db/index.json';
// --------------------

// --- 路径处理 ---
const inputPath = path.join(__dirname, inputFilename);
// outputPath: 获取输出文件的完整绝对路径
const outputPath = path.join(__dirname, outputFilename);
const outputDirPath = path.dirname(outputPath);

// ✨ 辅助函数：生成格式化的时间戳字符串
function getTimestamp() {
    const now = new Date();
    const YYYY = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const DD = String(now.getDate()).padStart(2, '0');
    const HH = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${YYYY}${MM}${DD}_${HH}${mm}${ss}`;
}

// --- 脚本核心逻辑开始 ---

// ✨ 1. 首先，检查原始文件是否存在，为后续备份做准备
const originalFileExists = fs.existsSync(outputPath);

let existingData = [];
let lastId = 0;
if (originalFileExists) {
    console.log(`正在读取现有文件: "${outputPath}"`);
    try {
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
    } catch (e) {
        console.warn(`[警告] 无法解析现有的 JSON 文件，将创建一个新文件。错误:`, e);
        existingData = [];
        lastId = 0;
    }
} else {
    console.log(`未找到现有的 "${outputPath}" 文件，将创建新文件。`);
}

// 2. 读取并处理新的文本数据... (这部分逻辑不变)
const existingUsersSet = new Set(existingData.map(item => item.user));
if (!fs.existsSync(inputPath)) {
    console.error(`错误：找不到输入文件 "${inputPath}"`);
    process.exit(1);
}
console.log(`正在从 "${inputFilename}" 文件中读取新数据...`);
const rawData = fs.readFileSync(inputPath, 'utf8');
const lines = rawData.split('\n');
const newData = [];
for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.length === 0) continue;
    if (trimmedLine.startsWith('user')) {
        const parts = trimmedLine.split('|');
        if (parts.length === 5) {
            const user = parts[0];
            if (!existingUsersSet.has(user)) {
                newData.push({
                    id: "",
                    status: "0", //状态默认为0
                    user: user,
                    password: parts[1],
                    email: parts[2],
                    emailPwd: parts[3],
                    country: parts[4],
                });
                existingUsersSet.add(user);
            }
        } else {
             console.warn(`[!] 已跳过格式错误的行: ${trimmedLine}`);
        }
    }
}

// 3. 如果有新数据，则进行备份、合并和写入
if (newData.length > 0) {
    console.log(`发现 ${newData.length} 条新记录，正在进行添加...`);

    // ✨ 4. 写入新文件之前，执行备份操作
    if (originalFileExists) {
        const timestamp = getTimestamp();
        const backupFilename = `index_${timestamp}.json`;
        const backupPath = path.join(outputDirPath, backupFilename);
        try {
            console.log(`正在备份旧文件到: ${backupPath}`);
            fs.copyFileSync(outputPath, backupPath);
            console.log('✅ 备份成功！');
        } catch (error) {
            console.error('[错误] 备份文件时失败:', error);
            console.error('为保证数据安全，已停止本次操作。请检查权限或磁盘空间。');
            process.exit(1); // 如果备份失败，则终止脚本，不执行写入
        }
    }

    // 5. 合并和重新编号... (这部分逻辑不变)
    let idCounter = lastId + 1;
    const processedNewData = newData.map(item => ({ ...item, id: String(idCounter++) }));
    const combinedData = [...existingData, ...processedNewData];
    const finalOutputObject = { data: combinedData };
    const jsonOutput = JSON.stringify(finalOutputObject, null, 2);

    // 6. 写入新文件... (这部分逻辑不变)
    if (!fs.existsSync(outputDirPath)) {
        fs.mkdirSync(outputDirPath, { recursive: true });
        console.log(`已自动创建输出目录: ${outputDirPath}`);
    }
    fs.writeFileSync(outputPath, jsonOutput, 'utf8');
    
    console.log(`\n✅ 成功！已添加 ${newData.length} 条新记录并写入文件。`);
    console.log(`文件 "${outputPath}" 现在总共包含 ${combinedData.length} 条记录。`);
} else {
    console.log('\n- 没有发现需要添加的新记录。文件内容未改变，无需备份。');
}
