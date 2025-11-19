#!/usr/bin/env node

/**
 * 小红书Cookie获取工具
 * - 自动从Chrome/Firefox浏览器导出小红书Cookie
 * - Usage: node get_xiaohongshu_cookie.js
 */

import fs from 'fs'
import path from 'path'
import { homedir } from 'os'

const COOKIE_FILE = '.xhs_cookie'

async function getChromeCookie() {
  try {
    const chromePaths = [
      path.join(homedir(), 'Library/Application Support/Google/Chrome/Default/Cookies'), // macOS
      path.join(homedir(), 'AppData/Local/Google/Chrome/User Data/Default/Network/Cookies'), // Windows
      path.join(homedir(), '.config/google-chrome/Default/Cookies') // Linux
    ]

    for (const cookiePath of chromePaths) {
      if (fs.existsSync(cookiePath)) {
        console.log('✓ 找到Chrome Cookie文件:', cookiePath)
        return cookiePath
      }
    }
  } catch (err) {
    console.log('✗ 无法访问Chrome Cookie:', err.message)
  }
  return null
}

async function getFirefoxCookie() {
  try {
    const firefoxPath = path.join(homedir(), 'Library/Application Support/Firefox/Profiles')
    if (fs.existsSync(firefoxPath)) {
      const profiles = fs.readdirSync(firefoxPath)
      for (const profile of profiles) {
        const cookiePath = path.join(firefoxPath, profile, 'cookies.sqlite')
        if (fs.existsSync(cookiePath)) {
          console.log('✓ 找到Firefox Cookie文件:', cookiePath)
          return cookiePath
        }
      }
    }
  } catch (err) {
    console.log('✗ 无法访问Firefox Cookie:', err.message)
  }
  return null
}

function parseCookieFromBrowser() {
  console.log('📱 请在小红书网页版登录后，使用以下方式获取Cookie：\n')
  console.log('Chrome/Firefox浏览器操作步骤：')
  console.log('1. 访问 https://www.xiaohongshu.com')
  console.log('2. 登录你的账号')
  console.log('3. 按 F12 打开开发者工具')
  console.log('4. 切换到 Console（控制台）标签')
  console.log('5. 输入以下代码并回车：')
  console.log('\n   document.cookie\n')
  console.log('6. 复制输出的所有内容（很长的字符串）\n')
}

async function saveCookie(cookieValue) {
  if (!cookieValue || !cookieValue.includes('a1=')) {
    console.log('\n✗ Cookie格式不正确，必须包含 a1= 字段')
    console.log('请确保已登录小红书，并复制完整的Cookie字符串')
    return false
  }

  const cookiePath = path.join(process.cwd(), COOKIE_FILE)
  fs.writeFileSync(cookiePath, cookieValue.trim())

  console.log('\n✓ Cookie已保存到:', cookiePath)
  console.log('\n请运行以下命令设置环境变量：')
  console.log(`\n   export XIAOHONGSHU_COOKIE="\$(cat ${COOKIE_FILE})"\n`)
  console.log('或者手动设置：')
  console.log(`\n   export XIAOHONGSHU_COOKIE="${cookieValue.substring(0, 50)}..."\n`)

  return true
}

async function main() {
  console.log('\n=====================================')
  console.log('  小红书Cookie获取工具')
  console.log('=====================================\n')

  const args = process.argv.slice(2)

  if (args.length > 0) {
    // 直接提供Cookie作为参数
    const cookie = args[0]
    await saveCookie(cookie)
    process.exit(0)
  }

  // 检查是否已有Cookie文件
  const existingCookie = path.join(process.cwd(), COOKIE_FILE)
  if (fs.existsSync(existingCookie)) {
    console.log('⚠️  发现已有的Cookie文件:', COOKIE_FILE)
    const existingValue = fs.readFileSync(existingCookie, 'utf8')
    console.log('   内容:', existingValue.substring(0, 50), '...')
    console.log('\n如果要覆盖，请删除该文件后重新运行\n')
  }

  parseCookieFromBrowser()

  // 提示用户输入
  process.stdout.write('请粘贴从浏览器复制的Cookie: ')

  let cookieValue = ''
  process.stdin.setEncoding('utf8')
  process.stdin.on('data', (chunk) => {
    cookieValue += chunk
  })

  process.stdin.on('end', async () => {
    await saveCookie(cookieValue.trim())
    process.exit(0)
  })
}

// 等待用户输入
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export default {
  getChromeCookie,
  getFirefoxCookie,
  saveCookie
}
