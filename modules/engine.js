import helper from './helper.js'
import createWorker from 'tesseract.js'

function merge_dicts (temp_dict) {
  const result = {}
  temp_dict.forEach(item => {
    for (const [key, value] of Object.entries(item)) {
      if (result[key]) {
        result[key] += value
      } else {
        result[key] = value
      }
    }
  })
  return result
}

async function detect (type, uuid, username, options, site, source = '', text_only = '', screen_shot = '') {
  const temp_profile = []
  const temp_detected = []
  let detections_count = 0
  await Promise.all(site.detections.map(async detection => {
    if (detection.type === 'shared') {
      const shared_detection = await helper.shared_detections.find(o => o.name === detection.name)
      const [val1, val2, val3] = await detect_logic(type, uuid, username, options, shared_detection, source, text_only, screen_shot)
      temp_profile.push(val1)
      temp_detected.push(val2)
      detections_count += val3
    } else if (detection.type === 'generic') {
      helper.verbose && console.log('None')
    } else if (detection.type === 'special') {
      if (detection.function === 'special_xiaohongshu_search') {
        const [val1, val2, val3] = await special_xiaohongshu_search(type, uuid, username, options, site, source, text_only, screen_shot)
        temp_profile.push(val1)
        temp_detected.push(val2)
        detections_count += val3
      }
    }
  }))

  const [val1, val2, val3] = await detect_logic(type, uuid, username, options, site, source, text_only, screen_shot)
  temp_profile.push(val1)
  temp_detected.push(val2)
  detections_count += val3
  return [merge_dicts(temp_profile), merge_dicts(temp_detected), detections_count]
}

async function detect_logic (type, uuid, username, options, site, source = '', text_only = '', screen_shot = '') {
  const temp_profile = Object.assign({}, helper.profile_template)
  const temp_detected = Object.assign({}, helper.detected_websites)
  let detections_count = 0
  await Promise.all(site.detections.map(async detection => {
    if (source !== '' && helper.detection_level[helper.detection_level.current][type].includes(detection.type) && detection.type !== 'shared' && detection.type !== 'generic' && detection.type !== 'special') {
      try {
        detections_count += 1
        temp_detected.count += 1
        let temp_found = 'false'
        if (detection.type === 'ocr' && screen_shot !== '' && options.includes('FindUserProfilesSlow')) {
          const temp_buffer_image = Buffer.from(screen_shot, 'base64')
          const ocr_worker = createWorker()
          try {
            await ocr_worker.load()
            await ocr_worker.loadLanguage('eng')
            await ocr_worker.initialize('eng')
            const {
              data: {
                text
              }
            } = await ocr_worker.recognize(temp_buffer_image)
            await ocr_worker.terminate()
            if (text !== '') {
              if (text.toLowerCase().includes(detection.string.toLowerCase())) {
                temp_found = 'true'
              }
              if (detection.return === temp_found) {
                temp_profile.found += 1
                temp_detected.ocr += 1
                if (detection.return === 'true') {
                  temp_detected.true += 1
                } else {
                  temp_detected.false += 1
                }
              }
            } else {
              detections_count -= 1
              temp_detected.count -= 1
            }
          } catch (err) {
            detections_count -= 1
            temp_detected.count -= 1
          }
        } else if (detection.type === 'normal' && source !== '') {
          if (source.toLowerCase().includes(detection.string.replace('{username}', username).toLowerCase())) {
            temp_found = 'true'
          }

          if (detection.return === temp_found) {
            temp_profile.found += 1
            temp_detected.normal += 1
            if (detection.return === 'true') {
              temp_detected.true += 1
            } else {
              temp_detected.false += 1
            }
          }
        } else if (detection.type === 'advanced' && text_only !== '' && text_only !== 'unavailable') {
          if (text_only.toLowerCase().includes(detection.string.replace('{username}', username).toLowerCase())) {
            temp_found = 'true'
          }

          if (detection.return === temp_found) {
            temp_profile.found += 1
            temp_detected.advanced += 1
            if (detection.return === 'true') {
              temp_detected.true += 1
            } else {
              temp_detected.false += 1
            }
          }
        }
      } catch (err) {
        helper.verbose && console.log(err)
      }
    }
  }))

  helper.verbose && console.log({
    'Temp Profile': temp_profile,
    Detected: temp_detected
  })

  return [temp_profile, temp_detected, detections_count]
}

async function special_xiaohongshu_search (type, uuid, username, options, site, source = '', text_only = '', screen_shot = '') {
  const temp_profile = Object.assign({}, helper.profile_template)
  const temp_detected = Object.assign({}, helper.detected_websites)
  let detections_count = 0

  try {
    helper.log_to_file_queue(uuid, `[Xiaohongshu] Checking if input is user_id or nickname: ${username}`)

    // 判断输入是 user_id 还是 昵称
    // user_id: 16-24位，只包含数字和小写字母a-f
    const is_user_id = /^[0-9a-f]{16,24}$/.test(username)

    if (is_user_id) {
      helper.log_to_file_queue(uuid, `[Xiaohongshu] Input detected as user_id, using directly: ${username}`)
      // 已经是user_id，不需要搜索
      temp_profile.found = 0
      temp_detected.count = 1
      temp_detected.false += 1
      detections_count = 1
    } else {
      helper.log_to_file_queue(uuid, `[Xiaohongshu] Input detected as nickname, searching for user_id: ${username}`)

      // 构建搜索URL
      const search_url = `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(username)}`

      // 获取Cookie
      const cookie = helper.get_site_cookie(site)
      const request_options = {
        headers: {
          ...helper.header_options.headers,
          'Cookie': cookie
        }
      }

      // 执行搜索请求
      const [search_ret, search_source] = await helper.get_url_wrapper_text_with_options(search_url, 5, request_options)

      if (search_source !== 'error-get-url' && search_source.includes('搜索结果')) {
        // 提取第一个用户结果（简单实现，使用正则表达式）
        const user_id_match = search_source.match(/user\/profile\/([0-9a-f]{16,24})/)

        if (user_id_match && user_id_match[1]) {
          const found_user_id = user_id_match[1]
          helper.log_to_file_queue(uuid, `[Xiaohongshu] Found user_id: ${found_user_id} for nickname: ${username}`)

          // 验证找到的用户
          const verify_url = `https://www.xiaohongshu.com/user/profile/${found_user_id}`
          const [verify_ret, verify_source] = await helper.get_url_wrapper_text_with_options(verify_url, 5, request_options)

          if (verify_source !== 'error-get-url' && verify_source.includes('获赞与收藏')) {
            helper.log_to_file_queue(uuid, `[Xiaohongshu] Verified user_id ${found_user_id} successfully`)

            // 返回结果，标记为需要进一步检测
            temp_profile.special_search_result = {
              original_input: username,
              found_user_id: found_user_id,
              verified: true
            }
            temp_profile.found = 1
            temp_detected.count = 1
            temp_detected.true += 1
            detections_count = 1
          } else {
            helper.log_to_file_queue(uuid, `[Xiaohongshu] Failed to verify user_id ${found_user_id}`)
            temp_profile.found = 0
            temp_detected.count = 1
            temp_detected.false += 1
            detections_count = 1
          }
        } else {
          helper.log_to_file_queue(uuid, `[Xiaohongshu] No user_id found in search results for: ${username}`)
          // 搜索不到用户，跳过处理
          temp_profile.found = 0
          temp_detected.count = 0
          detections_count = 0
        }
      } else {
        helper.log_to_file_queue(uuid, `[Xiaohongshu] Search request failed or blocked`)
        // 搜索失败，跳过处理
        temp_profile.found = 0
        temp_detected.count = 0
        detections_count = 0
      }
    }
  } catch (err) {
    helper.log_to_file_queue(uuid, `[Xiaohongshu] Search error: ${err.message}`)
    helper.verbose && console.log(err)
    temp_profile.found = 0
    temp_detected.count = 0
    detections_count = 0
  }

  helper.verbose && console.log({
    'Xiaohongshu Search Result': temp_profile.special_search_result || 'None',
    'Temp Profile': temp_profile,
    Detected: temp_detected
  })

  return [temp_profile, temp_detected, detections_count]
}

export default{
  detect,
  special_xiaohongshu_search
}
