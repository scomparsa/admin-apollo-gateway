# admin-apollo-gateway
> 后台阿波罗网关

## 🚀 快速启动（无需在终端选择）

根据模板 `.env.example` 创建 `.env.local` 文件，声明需要启动的项目

e.g.

```bash
# 如果启动多项目，用 ”,“ 分割
PROJECT_NAMES="projectA,projectB,projectC"
```

## NPM 脚本

- `npm start` - 本地开发
- `npm run fix:qconf` - 修复 QConf 路径问题（仅首次安装 node-qconf 时需要）
