# 多语言支持功能实现总结

## 🎉 功能概述

Social Analyzer 现已支持多语言界面，用户可以在英语和中文之间自由切换！

---

## 📦 实现文件清单

### 1. 语言配置文件
- ✅ `lang/en.json` - 英文翻译文件
- ✅ `lang/zh.json` - 中文翻译文件

### 2. 后端代码修改
- ✅ `modules/helper.js` - 添加语言加载和翻译函数
- ✅ `app.js` - 添加语言API路由和初始化

### 3. 前端代码修改
- ✅ `public/app.html` - 添加语言切换器和翻译应用

---

## 🛠️ 技术实现细节

### 后端架构

#### 1. Helper模块扩展 (modules/helper.js)

**新增函数:**

```javascript
// 加载语言文件
async function load_language(lang_code)
// 获取翻译文本
function get_text(key, default_val = '')
// 获取当前语言
function get_current_language()
// 设置当前语言
function set_language(lang_code)
```

**新增状态变量:**
```javascript
let current_language = 'en'
let translations = {}
```

#### 2. API路由 (app.js)

**GET /get_language**
- 功能: 获取当前语言和所有翻译
- 返回: `{current: 'en', available: ['en', 'zh'], translations: {...}}`

**POST /set_language**
- 功能: 切换语言
- 参数: `{lang: 'zh'}`
- 返回: `{success: true, language: 'zh'}`

#### 3. 初始化

在服务器启动时自动加载默认语言（英语）:
```javascript
await helper.load_language('en')
```

---

### 前端架构

#### 1. 语言切换器 (HTML)

在导航栏添加了下拉选择框:
```html
<select id="language-selector" class="form-control form-control-sm">
  <option value="en">English</option>
  <option value="zh">中文</option>
</select>
```

#### 2. JavaScript函数

**核心函数:**
```javascript
// 加载新语言
async function loadLanguage(langCode)

// 获取翻译
async function fetchTranslations()

// 应用翻译到界面
function applyTranslations()

// 获取翻译文本
function getTranslation(key, defaultVal = '')

// 初始化语言
async function initLanguage()
```

#### 3. 翻译应用机制

**页面元素更新:**
- `updateTextContent()` - 更新文本内容
- `updateButtonValue()` - 更新按钮value
- `updatePlaceholder()` - 更新占位符

**翻译键名格式:**
使用点号分隔的层级结构:
```javascript
'sections.enter_profile_name'  // 对应 {"sections": {"enter_profile_name": "..."}}
'buttons.analyze'              // 对应 {"buttons": {"analyze": "..."}}
'placeholders.username'        // 对应 {"placeholders": {"username": "..."}}
```

#### 4. 本地存储

使用localStorage保存用户选择:
```javascript
localStorage.setItem('social-analyzer-language', langCode)
const savedLang = localStorage.getItem('social-analyzer-language') || 'en'
```

---

## 🌐 支持的语言

### 英语 (en.json)
- 完整界面翻译
- 所有按钮和标签
- 提示信息和状态

### 中文 (zh.json)
- 完整界面翻译
- 符合中文用户习惯
- 专业术语准确

---

## 🎯 使用指南

### 通过Web界面使用

1. **启动服务**
```bash
npm start
```

2. **访问网站**
打开浏览器访问: http://localhost:9005/app.html

3. **切换语言**
在页面顶部导航栏找到语言选择器
点击下拉菜单选择: English 或 中文

4. **界面会自动刷新**
所有文本将立即切换到所选语言

**特色功能:**
- ✅ 自动保存语言偏好 (刷新页面后保持选择)
- ✅ 无缝切换 (无需重新加载页面)
- ✅ 完整覆盖 (所有界面元素都已翻译)

### 通过API使用

#### 获取当前语言
```bash
curl http://localhost:9005/get_language
```

**返回示例:**
```json
{
  "current": "en",
  "available": ["en", "zh"],
  "translations": {
    "app_name": "Social Analyzer",
    "buttons": {
      "analyze": "Analyze"
    }
  }
}
```

#### 切换语言
```bash
curl -X POST http://localhost:9005/set_language \
  -H "Content-Type: application/json" \
  -d '{"lang": "zh"}'
```

**返回示例:**
```json
{
  "success": true,
  "language": "zh"
}
```

---

## 📋 翻译键名对照表

### 应用信息
```json
{
  "app_name": "应用名称",
  "app_title": "页面标题"
}
```

### 导航栏
```json
{
  "nav": {
    "settings": "设置",
    "download": "下载",
    "watch": "关注"
  }
}
```

### 各区域标题
```json
{
  "sections": {
    "enter_profile_name": "输入用户名",
    "string_lookups": "字符串查找",
    "most_common_words": "各语言常用词",
    "extracted_names": "提取的名字及来源",
    "extracted_combinations": "提取的组合",
    "extracted_age": "提取的年龄信息",
    "extracted_words_info": "提取的词汇信息",
    "custom_search": "自定义搜索",
    "save_file": "保存文件",
    "metadata": "元数据",
    "statistics": "统计信息",
    "visualization": "可视化"
  }
}
```

### 按钮文本
```json
{
  "buttons": {
    "fast_options": "快速选项",
    "analyze": "开始分析",
    "clear": "清除",
    "reset": "重置",
    "save_text": "保存为文本",
    "save_json": "保存为JSON",
    "save_xml": "保存为XML",
    "download_json": "下载JSON"
  }
}
```

### 占位符
```json
{
  "placeholders": {
    "username": "输入要搜索的用户名...",
    "user_agent": "Mozilla/5.0...",
    "proxy": "http://host:port",
    "google_api_key": "Google API Key",
    "google_api_cs": "Google API CS"
  }
}
```

---

## 🔧 如何添加新语言

### 步骤1: 创建语言文件

在 `lang/` 目录下创建新语言文件，例如 `lang/es.json` (西班牙语):

```json
{
  "app_name": "Analizador Social",
  "app_title": "QeeqBox - Analizador Social",
  "sections": {
    "enter_profile_name": "Ingresar nombre de perfil",
    ...
  }
}
```

### 步骤2: 更新后端代码

**修改 modules/helper.js:**
```javascript
async function load_language(lang_code) {
  // 现有代码无需修改，会自动加载新语言文件
}
```

**修改 app.js:**
```javascript
app.post('/set_language', async function (req, res, next) {
  // 更新支持的语言列表
  if (req.body.lang && ['en', 'zh', 'es'].includes(req.body.lang)) {
    const result = await helper.load_language(req.body.lang)
    res.json(result)
  }
})
```

**修改 public/app.html:**
```html
<select id="language-selector">
  <option value="en">English</option>
  <option value="zh">中文</option>
  <option value="es">Español</option>  <!-- 添加新选项 -->
</select>
```

### 步骤3: 重启服务

```bash
npm restart
```

---

## 🧪 测试多语言功能

### 测试清单

- ✅ 页面加载时显示默认语言（英语）
- ✅ 可以切换到中文
- ✅ 切换后所有界面文本更新
- ✅ 刷新页面后保持语言选择
- ✅ 语言切换器样式正确
- ✅ API接口正常工作

### 自动化测试 (可选)

```javascript
// 测试语言切换
async function testMultilanguage() {
  // 测试加载英语
  const enResult = await fetch('/set_language', {
    method: 'POST',
    body: JSON.stringify({ lang: 'en' })
  }).then(r => r.json())
  console.assert(enResult.success === true)

  // 测试加载中文
  const zhResult = await fetch('/set_language', {
    method: 'POST',
    body: JSON.stringify({ lang: 'zh' })
  }).then(r => r.json())
  console.assert(zhResult.success === true)

  // 测试获取翻译
  const langData = await fetch('/get_language').then(r => r.json())
  console.assert(langData.current === 'zh')
  console.assert(langData.translations.app_name)
}
```

---

## 📖 架构设计亮点

### 1. 前后端分离
- 后端: 负责加载和管理翻译文件
- 前端: 负责应用翻译到界面

### 2. 非侵入式设计
- 不修改现有API接口
- 添加新的独立路由
- 不影响核心功能

### 3. 性能优化
- 翻译文件只加载一次
- 前端缓存翻译内容
- 按需应用翻译

### 4. 用户体验
- 即时切换，无需刷新
- 自动保存偏好
- 平滑过渡

### 5. 扩展性
- 易于添加新语言
- 翻译键名层级清晰
- 代码复用性高

---

## 🎉 总结

多语言功能已成功实现！用户现在可以在英语和中文之间自由切换，所有界面元素都已完整翻译。

**下一步建议:**
- 添加更多语言（西班牙语、法语、德语等）
- 优化某些专业术语的翻译
- 添加语言贡献指南
- 考虑使用专业的翻译平台

**技术债务:**
- 部分内容（如日志消息）尚未翻译
- 动态生成的文本可能需要额外处理
- 可以考虑使用更专业的国际化库（如i18next）

---

**实现日期**: 2025-11-17  
**实现者**: Claude (AI Assistant)  
**项目**: Social Analyzer  
**GitHub**: https://github.com/ryfineZ/social-analyzer
