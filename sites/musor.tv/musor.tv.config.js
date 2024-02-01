const cheerio = require('cheerio')
const dayjs = require('dayjs')
const axios = require('axios')
const utc = require('dayjs/plugin/utc')
const customParseFormat = require('dayjs/plugin/customParseFormat')

dayjs.extend(utc)
dayjs.extend(customParseFormat)

module.exports = {
  site: 'musor.tv',
  days: 2,
  request: {
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'hu,en;q=0.9,en-GB;q=0.8,en-US;q=0.7',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Ch-Ua': '"Not A(Brand";v="99", "Microsoft Edge";v="121", "Chromium";v="121"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Linux"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': "navigate",
      'Sec-Fetch-site': 'same-origin',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      'Referer': 'https://musor.tv/',
    }
  },
  url({ channel, date }) {
    return dayjs.utc().isSame(date, 'd')
      ? `https://musor.tv/mai/tvmusor/${channel.site_id}`
      : `https://musor.tv/napi/tvmusor/${channel.site_id}/${date.format('YYYY.MM.DD')}`
  },
  parser({ content }) {
    const programs = []
    const items = parseItems(content)
    items.forEach(item => {
      const prev = programs[programs.length - 1]
      const $item = cheerio.load(item)
      let start = parseStart($item)
      if (prev) prev.stop = start
      const stop = start.add(30, 'm')
      programs.push({
        title: parseTitle($item),
        description: parseDescription($item),
        image: parseImage($item),
        start,
        stop
      })
    })

    return programs
  },
  async channels() {
    const html = await axios
      .get('https://musor.tv/', this.request)
      .then(r => r.data)
      .catch(console.log)

    const $ = cheerio.load(html)
    const channels = $('body > div.big_content > div > nav > table > tbody > tr > td > a').toArray()
    return channels
      .map(item => {
        const $item = cheerio.load(item)
        const url = $item('*').attr('href')
        if (!url.startsWith('//musor.tv/mai/tvmusor/')) return null
        const site_id = url.replace('//musor.tv/mai/tvmusor/', '')
        return {
          lang: 'hu',
          site_id,
          name: $item('*').text()
        }
      })
      .filter(i => i)
  }
}

function parseImage($item) {
  const imgSrc = $item('div.smartpe_screenshot > img').attr('src')

  return imgSrc ? `https:${imgSrc}` : null
}

function parseTitle($item) {
  return $item('div:nth-child(2) > div > h3 > a').text().trim()
}

function parseDescription($item) {
  return $item('div:nth-child(5) > div > div').text().trim()
}

function parseStart($item) {
  let datetime = $item('div:nth-child(1) > div > div > div > div > time').attr('content')
  if (!datetime) return null

  return dayjs.utc(datetime.replace('GMT', 'T'), 'YYYY-MM-DDTHH:mm:ss')
}

function parseItems(content) {
  const $ = cheerio.load(content)

  return $('div.multicolumndayprogarea > div.smartpe_progentry').toArray()
}
