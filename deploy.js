// 简单的部署脚本
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

// 确保build目录存在
const buildDir = path.resolve('./build');
if (!fs.existsSync(buildDir)) {
  console.log('创建build目录...');
  fs.mkdirSync(buildDir, { recursive: true });
}

// 运行构建命令
console.log('开始构建项目...');
exec('npm run build', (error, stdout, stderr) => {
  if (error) {
    console.error(`构建错误: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`构建警告: ${stderr}`);
  }
  
  console.log(`构建输出: ${stdout}`);
  console.log('构建完成！输出目录: ./build');
  
  // 这里可以添加额外的部署步骤，如上传到服务器等
});
