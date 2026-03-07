#!/bin/bash

# 进入项目目录
cd "C:\Users\13329\PycharmProjects\ops-refiner"

# 检查是否已经初始化git仓库
if [ ! -d ".git" ]; then
    echo "初始化git仓库..."
    git init
    git remote add origin git@github.com:lzllzllzllzllzl/ops-refiner.git
    git config --global user.name "lzllzllzllzllzl"
    git config --global user.email "1332917377@qq.com"
fi

# 添加所有文件
echo "添加文件..."
git add .

# 提交代码
echo "提交代码..."
git commit -m "Update project"

# 推送到GitHub
echo "推送到GitHub..."
git checkout -b main
git push -f origin main

# 检查推送结果
if [ $? -eq 0 ]; then
    echo "✅ 代码推送成功！"
else
    echo "❌ 代码推送失败，请检查错误信息。"
fi