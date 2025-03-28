const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// 前端项目路径
const frontendPath = path.join(__dirname, 'frontend');
// 后端静态资源路径
const backendStaticPath = path.join(__dirname, 'backend', 'src', 'main', 'resources', 'static');

// 清理后端静态资源目录
function cleanBackendStatic() {
  if (fs.existsSync(backendStaticPath)) {
    fs.rmSync(backendStaticPath, { recursive: true, force: true });
  }
  fs.mkdirSync(backendStaticPath, { recursive: true });
}

// 编译前端代码
function buildFrontend() {
  return new Promise((resolve, reject) => {
    exec('npm run build', { 
      cwd: frontendPath,
      env: {
        ...process.env,
        VITE_API_BASE_URL: 'http://localhost:8080',//'http://1.94.62.193:8080', // 设置后端服务的 URL //http://1.94.62.193:8080
      },
    }, (error, stdout, stderr) => {
      if (error) {
        reject(`前端编译失败: ${stderr}`);
      } else {
        resolve(stdout);
      }
    });
  });
}

// 复制编译后的前端代码到后端静态资源目录
function copyFrontendToBackend() {
  const buildPath = path.join(frontendPath, 'dist');
  fs.cpSync(buildPath, backendStaticPath, { recursive: true });
}

// 主函数
async function main() {
  try {
    console.log('清理后端静态资源目录...');
    cleanBackendStatic();

    console.log('编译前端代码...');
    await buildFrontend();

    console.log('复制前端代码到后端静态资源目录...');
    copyFrontendToBackend();

    console.log('前端代码合并到后端完成！');
  } catch (error) {
    console.error('错误:', error);
    process.exit(1);
  }
}

main();