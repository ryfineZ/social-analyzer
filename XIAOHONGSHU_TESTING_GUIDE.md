# 小红书功能测试指南

## 测试前提

### 1. 设置环境变量

确保已经设置了 `XIAOHONGSHU_COOKIE` 环境变量：

```bash
# 检查是否已设置
export | grep XIAOHONGSHU_COOKIE

# 如果没有设置，运行：
export XIAOHONGSHU_COOKIE="你的Cookie字符串"
```

### 2. 验证Cookie格式

Cookie必须包含 `a1=` 字段，格式示例：
```
a1=xxx; web_session=xxx; web_id=xxx
```

## 测试方法

### 方法一：使用自动测试脚本（推荐）

运行专为小红书编写的测试脚本：

```bash
# 使用示例用户ID测试（可以替换为任意用户ID）
node test_xiaohongshu.js

# 或者指定特定用户ID测试
node test_xiaohongshu.js 5c309c6e000000001102f2f5
```

✅ **脚本将自动检查**：
- Cookie是否设置
- Cookie格式是否正确
- 能否找到小红书配置
- 能否获取Cookie
- 请求是否成功
- 页面内容是否符合预期

### 方法二：命令行测试

```bash
# 使用 nodejs CLI 测试单个用户（推荐）
nodejs app.js --username "5c309c6e000000001102f2f5" --metadata

# 或者使用 npm start
npm start
# 然后在Web界面输入用户ID测试
```

### 方法三：Web界面测试

1. 启动服务器：
```bash
npm start
```

2. 打开浏览器访问：
```
http://localhost:9005/app.html
```

3. 在输入框输入小红书用户ID（如：`5c309c6e000000001102f2f5`）

4. 选择 "ExtractMetadata" 和 "FindUserProfilesFast"

5. 点击 "Analyze" 开始分析

## 预期结果

### 成功情况

如果一切正常，你应该看到：

```
✓ Cookie已设置: a1=xxxxxxxxxxxxxxxxxxxxxxxx...
✓ 找到配置: xiaohongshu
✓ Cookie获取成功
✓ 返回状态码: 200
✓ 页面大小: 150000 字符
✓ 成功: 用户页面正常加载
```

提取的信息将显示在：
- **Profiles** 部分：基本信息
- **Metadata** 部分：元数据信息

### 失败情况

#### 错误：未设置Cookie
```
❌ 错误: 未设置 XIAOHONGSHU_COOKIE 环境变量
```
**解决**：
```bash
export XIAOHONGSHU_COOKIE="你的Cookie"
```

#### 错误：Cookie格式不正确
```
❌ 错误: Cookie格式不正确，必须包含 a1= 字段
```
**解决**：
重新获取Cookie，确保包含 `a1=` 字段

#### 错误：请求失败
```
❌ 错误: 请求失败
返回状态码: 403 或 302
```
**解决**：
- Cookie可能已过期，请重新获取
- 检查网络连接
- 确认用户ID是否正确

#### 警告：用户不存在
```
⚠️ 警告: 用户不存在（或Cookie失效）
```
**可能原因**：
- 用户ID错误
- Cookie失效
- 用户已注销

## 高级测试

### 批量测试多个用户

创建一个测试用户列表：
```bash
cat > test_users.txt << EOF
5c309c6e000000001102f2f5
5d123456000000001103f3f7
5e234567000000001104f4f8
EOF
```

然后批量测试：
```bash
while read user; do
  echo "测试用户: $user"
  nodejs app.js --username "$user" --metadata
  echo "---"
  sleep 2
done < test_users.txt
```

### 检查日志

查看详细日志：
```bash
# 日志文件在 logs/ 目录下
tail -f logs/*.log
```

## 故障排除

### 1. Cookie经常失效

- 小红书的Cookie有效期较短（约1-2天）
- 建议定期更新Cookie
- 可以设置定时任务自动获取

### 2. 请求被拒绝

现象：
```
403 Forbidden
或
重定向到登录页
```

解决：
- 更新Cookie
- 降低请求频率
- 使用代理IP

### 3. 页面内容变化

如果小红书改版，可能需要：
- 更新检测规则（detection strings）
- 调整选择器（selectors）
- 修改提取逻辑（extraction logic）

### 4. 调试模式

开启详细日志：
```bash
# 在 app.js 或 fast-scan.js 中
verbose = true
```

## 验证功能

### 检查项目清单

- [ ] Cookie已设置 ✓
- [ ] 小红书配置已加载 ✓
- [ ] 请求能正常发送 ✓
- [ ] 返回状态码200 ✓
- [ ] 页面包含用户信息 ✓
- [ ] 检测规则匹配正确 ✓
- [ ] 元数据提取成功 ✓

### 性能测试

测试响应时间：
```bash
time node test_xiaohongshu.js
```

正常响应时间：2-5秒

如果超过10秒，可能是：
- 网络延迟
- Cookie验证慢
- 小红书服务器响应慢

## 成功标准

测试通过的标志：
1. ✅ Cookie验证通过
2. ✅ 用户主页可访问
3. ✅ 状态码200
4. ✅ 页面包含"获赞与收藏"和"粉丝"
5. ✅ 能提取基本信息（至少标题和描述）

## 下一步

测试成功后，你可以：

1. **在真实场景中测试**
   - 输入真实的小红书用户ID
   - 批量测试多个用户
   - 查看提取的元数据

2. **集成到工作流**
   - 添加到自动化脚本
   - 与其他工具集成
   - 定期监控用户

3. **优化配置**
   - 调整检测规则
   - 添加更多提取字段
   - 优化请求频率

## 需要帮助？

如果遇到问题：
1. 查看日志文件
2. 检查Cookie是否有效
3. 确认网络连接正常
4. 使用 test_xiaohongshu.js 脚本诊断
5. 在Web界面尝试手动操作

---

**注意**: 小红书有严格的反爬机制，请：
- 不要频繁请求
- 使用有效的Cookie
- 尊重用户隐私
- 仅用于合法用途
