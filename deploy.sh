# 把 public 文件复制到 dist 中
cp -r public/* dist
name="./bb_reply_ext_v0.1.4"
mkdir "$name"
cp -r dist/* "./$name"
zip -q -r "./$name.zip" "./$name"
rm -rf "./$name"