#!/usr/bin/env bash
#
# json-toolbox 一键部署脚本
#
# 用法：
#   bash deploy.sh
#
# 前置条件：
#   1. 本机已配置免密登录：ssh-copy-id ubuntu@82.157.162.90
#   2. 服务器 Caddy 正以 /usr/share/caddy 为 root 提供服务（当前即此配置）
#
set -euo pipefail

# ---------- 配置 ----------
NAME="json-toolbox"
HOST="ubuntu@82.157.162.90"
DIR="/usr/share/caddy"
ENTRY="http://82.157.162.90/"
WEB_USER="caddy"

# ---------- 安全检查 ----------
# 远程会删除该目录下的 assets 与 index.html，路径写错后果严重，这里先卡死
case "${DIR}" in
  /var/www/?* | /usr/share/caddy) ;;
  *)
    echo "✗ DIR 不在允许列表内：${DIR}" >&2
    exit 1
    ;;
esac

# ---------- 1. 构建 ----------
echo "→ 构建中…"
npm run build

if [ ! -f dist/index.html ]; then
  echo "✗ 构建产物缺失：dist/index.html 不存在" >&2
  exit 1
fi

# ---------- 2. 打包 ----------
echo "→ 打包…"
rm -f dist.tar.gz
tar -czf dist.tar.gz -C dist .

# ---------- 3. 上传 ----------
echo "→ 上传到 ${HOST}…"
scp -q dist.tar.gz "${HOST}:~/"

# ---------- 4. 远程部署 ----------
# 只删 assets 和 index.html，保住 index.html.bak 等其它文件；
# --no-same-owner 避免 Windows 的 uid/gid 被带到服务器上。
echo "→ 远程解压…"
ssh "${HOST}" "set -e
  sudo rm -rf '${DIR}/assets'
  sudo rm -f  '${DIR}/index.html'
  sudo tar -xzf ~/dist.tar.gz -C '${DIR}' --no-same-owner
  sudo chown -R ${WEB_USER}:${WEB_USER} '${DIR}'
  rm -f ~/dist.tar.gz
"

# ---------- 5. 清理本地 ----------
rm -f dist.tar.gz

echo ""
echo "✓ 部署完成：${ENTRY}"
echo "  验证：curl -s ${ENTRY} | grep -o 'assets/index-[^\"]*\.js'"
echo "  提示：替换静态文件无需 reload caddy。"
