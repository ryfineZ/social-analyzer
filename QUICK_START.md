# 小红书功能快速开始

## 立即开始测试（1分钟）

### 步骤1: 运行测试脚本

这个脚本会自动检查你的Cookie设置并测试：

- 用户ID直接访问
- 昵称搜索功能（自动将昵称转换为user_id）
- 小红书连接和认证

```bash
node test_xiaohongshu.js
```

### 步骤2: 昵称搜索测试

现在支持**两种输入方式**：

#### 方式A: 用户ID（16-24位字符）

直接访问用户主页（最快）：

```bash
node test_xiaohongshu.js 5c309c6e000000001102f2f5
```

#### 方式B: 昵称搜索

自动搜索昵称并找到用户ID：

```bash
node test_xiaohongshu.js username
```

例如，输入 `yangmimi` 会自动：

1. 搜索小红书用户
2. 提取用户ID
3. 验证用户存在
4. 获取用户信息

这个脚本会自动检查你的Cookie设置并测试连接到小红书。

### 步骤3: 查看结果

如果看到 ✅ 符号，说明一切正常！

典型成功输出：
```
✓ Cookie已设置
✓ 找到配置: xiaohongshu
✓ Cookie获取成功
✓ 返回状态码: 200
✓ 页面大小: 150000 字符
✓ 成功: 用户页面正常加载
```

### 步骤3: 在Web界面测试

1. 如果测试通过，启动服务器：
```bash
npm start
```

2. 打开浏览器访问：http://localhost:9005/app.html

3. 输入小红书用户ID（例如：`5c309c6e000000001102f2f5`）

4. 在"Choose some options"中选择：
   - ☑ FindUserProfilesFast
   - ☑ ExtractMetadata

5. 点击 "Analyze" 按钮

6. 查看结果：
   - **Profiles** 标签页看到基本信息
   - **Metadata** 标签页看到详细元数据

## 常见问题快速解决

### ❌ "未设置 XIAOHONGSHU_COOKIE"

**快速解决**：
```bash
# 获取Cookie（按提示操作）
node get_xiaohongshu_cookie.js

# 设置环境变量（复制脚本输出的命令）
export XIAOHONGSHU_COOKIE="你的Cookie字符串"

# 重新测试
node test_xiaohongshu.js
```

### ❌ "Cookie格式不正确"

Cookie必须包含 `a1=` 字段。重新获取：
```bash
# 1. 打开Chrome访问小红书
# 2. 登录账号
# 3. 按F12打开开发者工具
# 4. 在Console输入: document.cookie
# 5. 复制输出的完整字符串
# 6. 运行:
node get_xiaohongshu_cookie.js "粘贴Cookie"
```

### ⚠️ "用户不存在"

可能原因：
- 用户ID错误（检查是否为16-24位字符）
- Cookie已过期（重新获取）
- 用户已注销

**尝试**：
```bash
# 用另一个用户ID测试
node test_xiaohongshu.js 5d123456000000001103f3f7
```

## 三种测试方式

### 方式1: 自动测试脚本（推荐）✨
```bash
node test_xiaohongshu.js
```
**优点**: 自动检查所有配置，快速诊断问题

### 方式2: 命令行测试
```bash
nodejs app.js --username "用户ID" --metadata
```
**优点**: 直接在终端查看JSON结果

### 方式3: Web界面测试
```bash
npm start
# 然后在浏览器输入用户ID
```
**优点**: 可视化结果，适合详细分析

## 测试用户ID示例

你可以用这些用户ID测试：
- `5c309c6e000000001102f2f5` (示例ID)
- 或者你自己的小红书用户ID
- 或者你关注的小红书博主ID

**注意**: 必须是16-24位的用户ID，不支持昵称（需要完整实现special函数）

## Cookie有效期

小红书的Cookie通常有效期：**1-3天**

如果测试突然失效，通常是Cookie过期：
```bash
# 重新获取Cookie
node get_xiaohongshu_cookie.js
```

## 快速验证清单

- [ ] Cookie已设置：`echo $XIAOHONGSHU_COOKIE | head -c50`
- [ ] 运行测试：`node test_xiaohongshu.js`
- [ ] 看到 ✅ 符号
- [ ] 状态码200
- [ ] 页面包含"获赞与收藏"

以上都通过？🎉 **恭喜！小红书功能已正常工作！**

## 需要帮助？

查看详细文档：
- [完整测试指南](XIAOHONGSHU_TESTING_GUIDE.md)
- [获取Cookie脚本](get_xiaohongshu_cookie.js)
- [项目管理](XIAOHONGSHU_IMPLEMENTATION_STATUS.md)
