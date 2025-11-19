#!/usr/bin/env node

/**
 * 小红书功能测试脚本
 * Usage: node test_xiaohongshu.js [user_id]
 */

import helper from './modules/helper.js'
import engine from './modules/engine.js'
import * as cheerio from 'cheerio'

// 测试用户ID（可以自己替换）
const TEST_USER_ID = process.argv[2] || '5c309c6e000000001102f2f5' // 示例用户

console.log('\n=====================================')
console.log('  小红书功能测试')
console.log('=====================================\n')

// 步骤1: 检查Cookie
console.log('步骤1: 检查环境变量 XIAOHONGSHU_COOKIE')
const cookie = process.env.XIAOHONGSHU_COOKIE
if (!cookie) {
  console.log('❌ 错误: 未设置 XIAOHONGSHU_COOKIE 环境变量')
  console.log('\n请运行: export XIAOHONGSHU_COOKIE="你的Cookie"')
  console.log('\n或使用脚本获取: node get_xiaohongshu_cookie.js\n')
  process.exit(1)
}

if (!cookie.includes('a1=')) {
  console.log('❌ 错误: Cookie格式不正确，必须包含 a1= 字段')
  console.log('请重新获取Cookie\n')
  process.exit(1)
}

console.log('✓ Cookie已设置:', cookie.substring(0, 50), '...\n')

// 步骤2: 查找小红书配置
console.log('步骤2: 查找小红书网站配置...')
const xhsSite = helper.websites_entries.find(site => site.type === 'xiaohongshu')
if (!xhsSite) {
  console.log('❌ 错误: 未找到小红书配置')
  process.exit(1)
}

console.log('✓ 找到配置:', xhsSite.type)
console.log('  URL:', xhsSite.url)
console.log('  需要Cookie:', xhsSite.requires_cookie || false)
console.log('  环境变量:', xhsSite.cookie_env || '无')
console.log('')

// 步骤3: 检查Cookie获取函数
console.log('步骤3: 测试Cookie获取函数...')
const siteCookie = helper.get_site_cookie(xhsSite)
if (!siteCookie) {
  console.log('❌ 错误: 无法获取Cookie')
  process.exit(1)
}
console.log('✓ Cookie获取成功\n')

// 步骤4: 测试请求
async function testRequest() {
  console.log('步骤4: 测试请求小红书用户主页...')
  console.log('  用户ID:', TEST_USER_ID)
  console.log('  请求URL:', xhsSite.url.replace('{username}', TEST_USER_ID))
  console.log('  请稍候...\n')

  try {
    // 准备请求选项
    const request_options = {
      headers: {
        ...helper.header_options.headers,
        'Cookie': siteCookie
      }
    }

    const url = xhsSite.url.replace('{username}', TEST_USER_ID)
    const [ret_code, source] = await helper.get_url_wrapper_text_with_options(url, 5, request_options)

    console.log('  返回状态码:', ret_code)

    if (source === 'error-get-url') {
      console.log('❌ 错误: 请求失败')
      process.exit(1)
    }

    // 检查内容长度
    console.log('  页面大小:', source.length, '字符')

    // 步骤5: 检测用户名是否存在
    console.log('\n步骤5: 检测用户是否存在...')

    // 使用detection规则检测
    const testUsername = 'test_user_' + Date.now()
    const result = await engine.detect('fast', 'test-uuid', testUsername, [], xhsSite, source)

    const [profile, detected, count] = result
    console.log('  检测规则数:', count)
    console.log('  匹配数:', profile.found)
    console.log('  检测类型:', JSON.stringify(detected, null, 2))

    // 检查关键词
    const hasUserNotFound = source.includes('用户不存在')
    const hasLikes = source.includes('获赞与收藏')
    const hasFans = source.includes('粉丝')

    console.log('\n  页面关键词检测:')
    console.log('    包含"用户不存在":', hasUserNotFound)
    console.log('    包含"获赞与收藏":', hasLikes)
    console.log('    包含"粉丝":', hasFans)

    if (hasLikes && hasFans) {
      console.log('\n✅ 成功: 用户页面正常加载，包含预期内容')
    } else if (hasUserNotFound) {
      console.log('\n⚠️  警告: 用户不存在（或Cookie失效）')
    } else {
      console.log('\n⚠️  警告: 页面内容异常，可能是反爬机制触发')
    }

    // 步骤6: 提取基本信息
    console.log('\n步骤6: 提取基本页面信息...')
    const $ = cheerio.load(source)
    const title = $('title').text()
    console.log('  页面标题:', title)

    // 尝试查找昵称（需要根据实际页面结构调整）
    const nickname = $('meta[name=\"description\"]').attr('content') || '未找到'
    console.log('  描述:', nickname.substring(0, 100))

    console.log('\n=====================================')
    console.log('  测试完成')
    console.log('=====================================\n')

    console.log('✅ 基础功能测试通过！')
    console.log('\n接下来你可以：')
    console.log('1. 在Web界面输入小红书用户ID测试')
    console.log('2. 使用命令行测试: nodejs app.js --username 用户ID --metadata')
    console.log('3. 查看日志了解更多详情\n')

  } catch (err) {
    console.log('\n❌ 错误:', err.message)
    console.log(err.stack)
    process.exit(1)
  }
}

testRequest().catch(console.error)
