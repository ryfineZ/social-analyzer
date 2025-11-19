import helper from './helper.js'
import * as cheerio from 'cheerio'


const strings_meta = new RegExp('regionsAllowed|width|height|color|rgba\\(|charset|viewport|refresh|equiv', 'i')
async function extract_metadata (site, source) {
  try {
    const $ = cheerio.load(source)
    const meta = $('meta')
    const temp_metadata_list = []
    const temp_metadata_for_checking = []
    Object.keys(meta).forEach(function (key) {
      if (meta[key].attribs) {
        if (!temp_metadata_for_checking.includes(meta[key].attribs) && !strings_meta.test(JSON.stringify(meta[key].attribs))) {
          temp_metadata_for_checking.push(meta[key].attribs)
          const temp_dict = {}
          let add = true

          if (meta[key].attribs.property) {
            temp_dict.property = meta[key].attribs.property
          }
          if (meta[key].attribs.name) {
            temp_dict.name = meta[key].attribs.name
          }
          if (meta[key].attribs.itemprop) {
            temp_dict.itemprop = meta[key].attribs.itemprop
          }
          if (meta[key].attribs.content) {
            if (meta[key].attribs.content.replace('\n', '').replace('\t', '').replace('\r', '').trim() !== '') {
              temp_dict.content = meta[key].attribs.content
            }
          }

          ['property', 'name', 'itemprop'].forEach((item, i) => {
            if (temp_dict[item]) {
              temp_metadata_list.forEach((_item, i) => {
                if (_item[item]) {
                  if (_item[item] === temp_dict[item]) {
                    temp_metadata_list[i].content += ', ' + temp_dict.content
                    add = false
                  }
                }
              })
            }
          })

          if (add && Object.keys(temp_dict).length !== 0) {
            temp_metadata_list.push(temp_dict)
          }
        }
      }
    })
    return temp_metadata_list
  } catch (err) {
    helper.verbose && console.log(err)
    return []
  }
}

async function extract_patterns (site, source) {
  try {
    const temp_patterns_list = []
    const temp_patterns_for_checking = []
    if ('extract' in site) {
      site.extract.forEach((item, i) => {
        const regex_pattern = new RegExp(item.regex, 'g')
        let found = null
        while (found = regex_pattern.exec(source)) {
          if (!temp_patterns_for_checking.includes(found[1])) {
            temp_patterns_for_checking.push(found[1])
            if (item.type === 'link') {
              found[1] = decodeURIComponent(found[1])
            }
            temp_patterns_list.push({
              type: item.type,
              matched: found[1]
            })
          }
        }
      })
    }
    return temp_patterns_list
  } catch (err) {
    helper.verbose && console.log(err)
    return []
  }
}

async function extract_xiaohongshu_profile (site, source) {
  try {
    const $ = cheerio.load(source)
    const extracted_data = {
      nickname: '',
      bio: '',
      avatar: '',
      stats: {}
    }

    // 提取昵称
    const nickname_match = source.match(/\"nickname\":\"([^"]+)\"/)
    if (nickname_match && nickname_match[1]) {
      extracted_data.nickname = decodeURIComponent(nickname_match[1])
    }

    // 提取简介
    const bio_match = source.match(/\"desc\":\"([^"]+)\"/)
    if (bio_match && bio_match[1]) {
      extracted_data.bio = decodeURIComponent(bio_match[1])
    }

    // 提取头像
    const avatar_match = source.match(/\"avatar\":\"([^"]+)\"/)
    if (avatar_match && avatar_match[1]) {
      extracted_data.avatar = avatar_match[1].replace(/\\\//g, '/')
    }

    // 提取统计数据：获赞与收藏、粉丝、关注
    const like_pattern = /获赞与收藏\s*\n?\s* (\d+)/
    const fans_pattern = /粉丝\s*\n?\s* (\d+[\w.]*)\n?\s*获赞与收藏/
    const following_pattern = /关注\s*\n?\s* (\d+[\w.]*)/

    const like_match = source.match(like_pattern)
    const fans_match = source.match(fans_pattern)
    const following_match = source.match(following_pattern)

    extracted_data.stats = {
      likes: like_match && like_match[1] ? like_match[1] : '0',
      fans: fans_match && fans_match[1] ? fans_match[1] : '0',
      following: following_match && following_match[1] ? following_match[1] : '0'
    }

    return extracted_data
  } catch (err) {
    helper.verbose && console.log('[Xiaohongshu Extraction Error]', err)
    return null
  }
}

export default{
  extract_patterns,
  extract_metadata,
  extract_xiaohongshu_profile
}
