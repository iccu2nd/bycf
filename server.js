import express from 'express'
import puppeteer from 'puppeteer-core'
import chromium from 'chrome-aws-lambda'
import { fileURLToPath } from 'url'
import path from 'path'
import crypto from 'crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use(express.static('public'))

let browserInstance = null

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
]

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

async function getBrowser() {
  if (browserInstance) return browserInstance

  const isDev = process.env.NODE_ENV !== 'production'
  const executablePath = isDev
    ? '/usr/bin/google-chrome'
    : await chromium.executablePath

  browserInstance = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-blink-features=AutomationControlled',
      '--window-size=1920,1080',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-ipc-flooding-protection',
      '--disable-back-forward-cache',
      '--disable-features=SharedArrayBuffer',
      '--disable-features=OutOfBlinkCors',
      '--disable-site-isolation-trials',
      '--disable-optimize-bytes',
      '--disable-accelerated-2d-canvas',
      '--disable-accelerated-jpeg-decoding',
      '--disable-accelerated-mjpeg-decode',
      '--disable-accelerated-video-decode',
      '--disable-accelerated-video-encode',
      '--disable-application-cache',
      '--disable-client-side-phishing-detection',
      '--disable-component-update',
      '--disable-default-apps',
      '--disable-domain-reliability',
      '--disable-extensions',
      '--disable-file-system',
      '--disable-ftp',
      '--disable-hang-monitor',
      '--disable-infobars',
      '--disable-java',
      '--disable-notifications',
      '--disable-password-generation',
      '--disable-password-manager-reauthentication',
      '--disable-remote-fonts',
      '--disable-speech-api',
      '--disable-sync',
      '--disable-translate',
      '--disable-voice-input',
      '--disable-wake-on-wifi',
      '--enable-features=NetworkService,NetworkServiceInProcess',
      '--force-fieldtrials=*',
      '--ignore-certificate-errors',
      '--ignore-ssl-errors',
      '--log-level=3',
      '--no-default-browser-check',
      '--no-first-run',
      '--disable-background-networking',
      '--disable-component-extensions-with-background-pages',
      '--disable-default-apps',
      '--disable-extensions',
      '--disable-plugins',
      '--disable-translate',
      '--disable-sync',
      '--disable-features=TranslateUI',
      '--disable-offer-store-unmasked-wallet-cards',
      '--disable-print-preview',
      '--disable-prompt-on-repost',
      '--disable-speech-api',
      '--disable-voice-input',
      '--disable-wake-on-wifi',
      '--disable-wallet',
      '--disable-webusb',
      '--disable-webgl',
      '--disable-cookie-encryption',
      '--disable-crash-reporter',
      '--disable-databases',
      '--disable-device-discovery-notifications',
      '--disable-domain-reliability',
      '--disable-download-notification',
      '--disable-file-manager',
      '--disable-geolocation',
      '--disable-history-quick-provider',
      '--disable-instant-extended-api',
      '--disable-login-animations',
      '--disable-media-session-api',
      '--disable-navigation-error-correction',
      '--disable-new-avatar-menu',
      '--disable-ntp-most-likely-favicons-from-server',
      '--disable-ntp-popular-sites',
      '--disable-ntp-snippets',
      '--disable-offer-store-unmasked-wallet-cards',
      '--disable-password-generation',
      '--disable-password-manager-reauthentication',
      '--disable-remote-fonts',
      '--disable-save-password-bubble',
      '--disable-search-geolocation-disclosure',
      '--disable-session-crashed-bubble',
      '--disable-software-rasterizer',
      '--disable-tab-for-desktop',
      '--disable-themes',
      '--disable-touch-drag-drop',
      '--disable-tts',
      '--disable-usb-keyboard-detect',
      '--disable-wake-on-wifi',
      '--disable-web-notification-custom-layouts',
      '--disable-bundled-ppapi-flash',
      '--disable-features=CalculateNativeWinOcclusion,WinUseBrowserSpellchecker,WebUsb,WebRtcHideLocalIpsWithMdns,WebRtcUseEchoCancellation3,AvoidUnnecessaryBeforeUnloadCheckSync,IntensiveWakeUpThrottling,IdleDetection,LazyFrameLoading,ClientHints,NetworkQualityEstimator,PrefetchPrivacyChanges,PrivacySandboxSettings3,SecurePaymentConfirmation,WebOTP,WebPayments,WebXR'
    ],
    executablePath,
    headless: true,
    ignoreHTTPSErrors: true,
    defaultViewport: { width: 1920, height: 1080 }
  })

  return browserInstance
}

async function createPage() {
  const browser = await getBrowser()
  const page = await browser.newPage()

  const ua = randomUA()
  await page.setUserAgent(ua)
  await page.setViewport({ width: 1920, height: 1080 })
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Sec-Ch-Ua': '"Not/A)Brand";v="99", "Google Chrome";v="126", "Chromium";v="126"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1'
  })

  await page.evaluateOnNewDocument(() => {
    delete window.navigator.webdriver
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined })
    
    Object.defineProperty(navigator, 'plugins', {
      get: () => [
        { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
        { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
        { name: 'Native Client', filename: 'internal-nacl-plugin' }
      ]
    })
    
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] })
    Object.defineProperty(navigator, 'platform', { get: () => 'Win32' })
    Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 })
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 12 })
    
    window.chrome = {
      runtime: {},
      loadTimes: () => {},
      csi: () => {},
      app: {}
    }
    
    window.toString = () => '[object Window]'
    
    const originalQuery = window.navigator.permissions.query
    window.navigator.permissions.query = (parameters) => (
      parameters.name === 'notifications' 
        ? Promise.resolve({ state: Notification.permission })
        : originalQuery(parameters)
    )
    
    delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array
    delete window.cdc_adoQpoasnfa76pfcZLmcfl_JSON
    delete window.cdc_adoQpoasnfa76pfcZLmcfl_Object
    delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise
    delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol
  })

  return page
}

async function solveTurnstile(page, siteKey, action = 'login') {
  try {
    const token = await page.evaluate(async (siteKey, action) => {
      return new Promise((resolve, reject) => {
        try {
          const script = document.createElement('script')
          script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
          script.async = true
          script.defer = true
          script.onload = () => {
            try {
              if (typeof turnstile === 'undefined') {
                reject(new Error('Turnstile not loaded'))
                return
              }
              
              const widgetId = turnstile.render('.turnstile-container, .cf-turnstile, [data-sitekey]', {
                sitekey: siteKey,
                action: action,
                callback: (token) => {
                  resolve(token)
                },
                'error-callback': (error) => {
                  reject(new Error('Turnstile error: ' + error))
                },
                'expired-callback': () => {
                  reject(new Error('Turnstile expired'))
                },
                'timeout-callback': () => {
                  reject(new Error('Turnstile timeout'))
                },
                theme: 'light',
                size: 'normal',
                appearance: 'always'
              })
              
              if (!widgetId) {
                reject(new Error('Failed to render turnstile'))
              }
            } catch (e) {
              reject(e)
            }
          }
          script.onerror = () => reject(new Error('Failed to load turnstile script'))
          document.head.appendChild(script)
        } catch (e) {
          reject(e)
        }
      })
    }, siteKey, action)
    
    return token
  } catch (error) {
    return null
  }
}

async function bypassCloudflare(url, options = {}) {
  const {
    siteKey = null,
    action = 'login',
    waitTime = 15000,
    timeout = 120000,
    takeScreenshot = true,
    returnHtml = true,
    returnCookies = true,
    solveTurnstile = true,
    useProxy = false,
    customHeaders = {},
    customUserAgent = null,
    viewport = { width: 1920, height: 1080 }
  } = options

  let page = null
  const startTime = Date.now()

  try {
    page = await createPage()

    if (customUserAgent) {
      await page.setUserAgent(customUserAgent)
    }

    if (viewport) {
      await page.setViewport(viewport)
    }

    if (Object.keys(customHeaders).length > 0) {
      await page.setExtraHTTPHeaders(customHeaders)
    }

    let turnstileToken = null

    if (solveTurnstile && siteKey) {
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      })

      await page.waitForSelector('.turnstile-container, .cf-turnstile, [data-sitekey]', {
        timeout: 10000
      }).catch(() => {})

      turnstileToken = await solveTurnstile(page, siteKey, action)

      if (turnstileToken) {
        await page.evaluate((token) => {
          const inputs = document.querySelectorAll('input[name="cf-turnstile-response"], input[name="turnstile"], input[name="token"]')
          inputs.forEach(input => input.value = token)
          
          const forms = document.querySelectorAll('form')
          forms.forEach(form => {
            const input = document.createElement('input')
            input.type = 'hidden'
            input.name = 'cf-turnstile-response'
            input.value = token
            form.appendChild(input)
          })
        }, turnstileToken)
      }
    }

    let response = null
    let retries = 0
    const maxRetries = 3

    while (retries < maxRetries) {
      try {
        response = await page.goto(url, {
          waitUntil: 'networkidle2',
          timeout: timeout,
          referer: url
        })
        break
      } catch (e) {
        retries++
        if (retries >= maxRetries) throw e
        await new Promise(r => setTimeout(r, 2000))
      }
    }

    await page.waitForFunction(
      () => {
        const title = document.title || ''
        const body = document.body?.innerText || ''
        return !title.includes('Just a moment') &&
               !title.includes('Checking your browser') &&
               !title.includes('Cloudflare') &&
               !body.includes('Just a moment') &&
               !body.includes('Checking your browser') &&
               !body.includes('Cloudflare')
      },
      { timeout: 60000 }
    )

    if (waitTime > 0) {
      await new Promise(r => setTimeout(r, waitTime))
    }

    const finalUrl = page.url()
    let finalHtml = ''
    let screenshot = null
    let finalCookies = {}
    let title = ''
    let status = 200

    try {
      title = await page.title()
    } catch {}

    if (returnHtml) {
      finalHtml = await page.content()
    }

    if (takeScreenshot) {
      screenshot = await page.screenshot({ encoding: 'base64', fullPage: false })
    }

    if (returnCookies) {
      const cookies = await page.cookies()
      finalCookies = cookies.reduce((acc, c) => {
        acc[c.name] = c.value
        return acc
      }, {})
    }

    const challengeSolved = !title.includes('Just a moment') &&
                           !title.includes('Checking your browser') &&
                           !finalHtml.includes('Just a moment') &&
                           !finalHtml.includes('Checking your browser')

    return {
      success: true,
      challengeSolved,
      turnstileSolved: !!turnstileToken,
      turnstileToken: turnstileToken || null,
      url: finalUrl,
      status: status,
      title: title,
      html: finalHtml,
      cookies: finalCookies,
      screenshot: screenshot,
      executionTime: Date.now() - startTime,
      userAgent: await page.evaluate(() => navigator.userAgent),
      viewport: await page.viewport()
    }

  } catch (error) {
    return {
      success: false,
      error: error.message,
      url: url,
      challengeSolved: false,
      turnstileSolved: false,
      executionTime: Date.now() - startTime
    }
  } finally {
    if (page) {
      try {
        await page.close()
      } catch {}
    }
  }
}

app.post('/api/bypass', async (req, res) => {
  const { url, siteKey, action, waitTime, timeout, takeScreenshot, returnHtml, returnCookies, solveTurnstile, customUserAgent, viewport } = req.body

  if (!url) {
    return res.status(400).json({ error: 'URL is required' })
  }

  if (!siteKey) {
    return res.status(400).json({ error: 'SiteKey is required' })
  }

  try {
    const result = await bypassCloudflare(url, {
      siteKey,
      action: action || 'login',
      waitTime: waitTime || 15000,
      timeout: timeout || 120000,
      takeScreenshot: takeScreenshot !== false,
      returnHtml: returnHtml !== false,
      returnCookies: returnCookies !== false,
      solveTurnstile: solveTurnstile !== false,
      customUserAgent: customUserAgent || null,
      viewport: viewport || { width: 1920, height: 1080 }
    })

    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/test', async (req, res) => {
  const { url, siteKey } = req.query

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' })
  }

  if (!siteKey) {
    return res.status(400).json({ error: 'SiteKey parameter is required' })
  }

  try {
    const result = await bypassCloudflare(url, {
      siteKey: siteKey,
      action: 'login',
      waitTime: 10000,
      timeout: 60000,
      takeScreenshot: true,
      returnHtml: true,
      returnCookies: true,
      solveTurnstile: true
    })

    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    browser: !!browserInstance,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app