// GYM 12: a detecção do ambiente da página de instalação (install/detect.js), com user agents reais.
import { describe, expect, it } from 'vitest'
import { detectEnv, currentEnv } from './detect.js'

// User agents copiados de aparelhos e navegadores reais (versões de 2024–2025).
const UA = {
  instagramIos: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 300.0.0.0.0 (iPhone14,5; iOS 17_5; pt_BR; pt; scale=3.00; 1170x2532; 512345678)',
  instagramAndroid: 'Mozilla/5.0 (Linux; Android 14; SM-S911B Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0.6367.82 Mobile Safari/537.36 Instagram 300.0.0.0.0 Android (34/14; 480dpi; 1080x2340; samsung; SM-S911B; dm1q; qcom; pt_BR; 512345678)',
  facebookIos: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/459.0.0.39.106;FBBV/584520104;FBDV/iPhone15,2;FBMD/iPhone;FBSN/iOS;FBSV/17.4.1;FBSS/3;FBID/phone;FBLC/pt_BR;FBOP/5;FBRV/586219003]',
  facebookAndroid: 'Mozilla/5.0 (Linux; Android 13; moto g(60) Build/T1RGS33.53-23-17; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/123.0.6312.118 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/459.0.0.48.106;]',
  messengerIos: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 LightSpeed [FBAN/MessengerLiteForiOS;FBAV/435.0.0.39.108;FBBV/531226347;FBDV/iPhone13,2;FBMD/iPhone;FBSN/iOS;FBSV/16.6;FBSS/3;FBCR/;FBID/phone;FBLC/pt_BR;FBOP/0]',
  safariIphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  chromeIphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0.6478.54 Mobile/15E148 Safari/604.1',
  firefoxIphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/127.0 Mobile/15E148 Safari/605.1.15',
  edgeIphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 EdgiOS/125.2535.87 Mobile/15E148 Safari/605.1.15',
  googleAppIphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) GSA/321.0.648055787 Mobile/15E148 Safari/604.1',
  ipadOld: 'Mozilla/5.0 (iPad; CPU OS 12_5_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.2 Mobile/15E148 Safari/604.1',
  // iPadOS 13+ no Safari: o mesmo UA do Safari do Mac; só o toque diferencia.
  ipadDesktop: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  chromeAndroid: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
  samsungInternet: 'Mozilla/5.0 (Linux; Android 14; SAMSUNG SM-A546E) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36',
  chromeDesktop: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  chromeMac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  safariMac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  firefoxLinux: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0',
}

describe('detectEnv', () => {
  it.each([
    ['Instagram no iPhone', UA.instagramIos, 5, 'inapp'],
    ['Instagram no Android', UA.instagramAndroid, 5, 'inapp'],
    ['Facebook no iPhone', UA.facebookIos, 5, 'inapp'],
    ['Facebook no Android', UA.facebookAndroid, 5, 'inapp'],
    ['Messenger no iPhone', UA.messengerIos, 5, 'inapp'],
    ['Safari no iPhone', UA.safariIphone, 5, 'ios-safari'],
    ['Safari num iPad antigo (UA de iPad)', UA.ipadOld, 5, 'ios-safari'],
    ['Safari no iPad (iPadOS com UA de Mac + toque)', UA.ipadDesktop, 5, 'ios-safari'],
    ['Chrome no iPhone', UA.chromeIphone, 5, 'ios-other'],
    ['Firefox no iPhone', UA.firefoxIphone, 5, 'ios-other'],
    ['Edge no iPhone', UA.edgeIphone, 5, 'ios-other'],
    ['app do Google no iPhone', UA.googleAppIphone, 5, 'ios-other'],
    ['Chrome no Android', UA.chromeAndroid, 5, 'android'],
    ['Samsung Internet', UA.samsungInternet, 5, 'android'],
    ['Chrome no Windows', UA.chromeDesktop, 0, 'desktop'],
    ['Chrome no Mac', UA.chromeMac, 0, 'desktop'],
    ['Safari no Mac (sem toque)', UA.safariMac, 0, 'desktop'],
    ['Firefox no Linux', UA.firefoxLinux, 0, 'desktop'],
  ])('%s → %s', (_, ua, maxTouchPoints, want) => {
    expect(detectEnv(ua, { maxTouchPoints })).toBe(want)
  })

  it('instalado vence tudo: display-mode standalone ou navigator.standalone', () => {
    for (const ua of Object.values(UA)) {
      expect(detectEnv(ua, { displayModeStandalone: true })).toBe('installed')
      expect(detectEnv(ua, { standalone: true, maxTouchPoints: 5 })).toBe('installed')
    }
  })

  it('in-app vence o iOS e o Android (o WebView do Instagram também diz iPhone/Android)', () => {
    expect(detectEnv(UA.instagramIos, { maxTouchPoints: 5 })).toBe('inapp')
    expect(detectEnv(UA.facebookAndroid, { maxTouchPoints: 5 })).toBe('inapp')
  })

  it('Mac com 1 ponto de toque (trackpad relatado por alguns navegadores) continua desktop', () => {
    expect(detectEnv(UA.safariMac, { maxTouchPoints: 1 })).toBe('desktop')
  })

  it('aguenta entrada vazia ou estranha', () => {
    expect(detectEnv('')).toBe('desktop')
    expect(detectEnv(undefined)).toBe('desktop')
    expect(detectEnv(null, {})).toBe('desktop')
    expect(detectEnv(UA.safariIphone, { maxTouchPoints: undefined })).toBe('ios-safari')
    expect(detectEnv(UA.safariIphone, { standalone: 'true' })).toBe('ios-safari')
  })
})

describe('currentEnv', () => {
  const win = (ua, { touch = 0, standalone, dm = false } = {}) => ({
    navigator: { userAgent: ua, maxTouchPoints: touch, standalone },
    matchMedia: q => ({ matches: q === '(display-mode: standalone)' && dm }),
  })
  it('lê o navegador', () => {
    expect(currentEnv(win(UA.safariIphone, { touch: 5 }))).toBe('ios-safari')
    expect(currentEnv(win(UA.safariIphone, { touch: 5, standalone: true }))).toBe('installed')
    expect(currentEnv(win(UA.chromeAndroid, { touch: 5, dm: true }))).toBe('installed')
    expect(currentEnv(win(UA.ipadDesktop, { touch: 5 }))).toBe('ios-safari')
    expect(currentEnv(win(UA.chromeDesktop))).toBe('desktop')
  })
  it('sem matchMedia nem navigator: desktop, sem erro', () => {
    expect(currentEnv({})).toBe('desktop')
    expect(currentEnv({ get navigator() { throw new Error('x') } })).toBe('desktop')
  })
})
