/* 运行环境探测与摄像头能力检测（微信内置浏览器适配）。
 *
 * 微信内置浏览器的现实情况：
 *  - 安卓 XWeb/X5 内核：部分版本支持 getUserMedia，部分不支持；
 *  - iOS WKWebView：iOS 14.3+ 才给 WebRTC，且仍常见失败；
 *  - 最危险的是"Promise 永久挂起"：既不 resolve 也不 reject，页面会一直卡住。
 * 因此不能只判断 API 是否存在，必须带超时探测，并在失败时自动降级到
 * 不需要摄像头的展示模式，保证扫码进来一定能看到内容。
 */
(function () {
  'use strict';

  var ua = navigator.userAgent || '';

  var Env = {
    ua: ua,
    isWeChat: /MicroMessenger/i.test(ua),
    isWeChatWork: /wxwork/i.test(ua),
    isQQ: /\bQQ\//i.test(ua) || /QBWebView/i.test(ua),
    isIOS: /iPad|iPhone|iPod/i.test(ua) || (/Macintosh/i.test(ua) && 'ontouchend' in document),
    isAndroid: /Android/i.test(ua),
    // 微信内无法用 JS 直接跳出到外部浏览器（微信禁止），只能引导用户手动操作
    get isInAppBrowser() { return this.isWeChat || this.isWeChatWork || this.isQQ; },
    get isSecure() { return window.isSecureContext === true; },
    get hasMediaDevices() {
      return !!(navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function');
    },
    get hasWebGL() {
      try {
        var c = document.createElement('canvas');
        return !!(c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl'));
      } catch (e) { return false; }
    }
  };

  /**
   * 带超时的摄像头探测。
   * 微信里 getUserMedia 可能永久挂起，所以用 Promise.race 加超时兜底。
   * 成功时返回 stream（调用方负责在用完后 stop），失败/超时返回 {error}。
   * 超时会主动尝试停掉迟到的流，避免摄像头指示灯一直亮着。
   */
  Env.probeCamera = function (timeoutMs, constraints) {
    var ms = timeoutMs || 8000;
    if (!Env.isSecure) {
      return Promise.resolve({ error: 'insecure', message: '非 HTTPS 环境，浏览器不允许调用摄像头' });
    }
    if (!Env.hasMediaDevices) {
      return Promise.resolve({ error: 'unsupported', message: '当前浏览器不支持网页摄像头' });
    }

    var settled = false;
    var lateStream = null;

    var request = navigator.mediaDevices.getUserMedia(constraints || {
      video: { facingMode: { ideal: 'environment' } }, audio: false
    }).then(function (stream) {
      if (settled) { // 超时后才回来，立即释放
        try { stream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {}
        return { error: 'timeout-late', message: '摄像头响应超时' };
      }
      settled = true;
      return { stream: stream };
    }).catch(function (err) {
      settled = true;
      var name = err && err.name ? err.name : 'Error';
      var map = {
        NotAllowedError: '摄像头权限被拒绝',
        PermissionDeniedError: '摄像头权限被拒绝',
        NotFoundError: '未找到可用摄像头',
        DevicesNotFoundError: '未找到可用摄像头',
        NotReadableError: '摄像头被其他应用占用',
        TrackStartError: '摄像头被其他应用占用',
        OverconstrainedError: '摄像头不支持所要求的参数',
        SecurityError: '浏览器安全策略阻止了摄像头'
      };
      return { error: name, message: map[name] || ('摄像头启动失败（' + name + '）') };
    });

    var timeout = new Promise(function (resolve) {
      setTimeout(function () {
        if (settled) return;
        settled = true;
        resolve({ error: 'timeout', message: '摄像头无响应（微信内置浏览器常见）' });
      }, ms);
    });

    return Promise.race([request, timeout]);
  };

  /** 释放探测用的流 */
  Env.stopStream = function (stream) {
    if (!stream) return;
    try { stream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {}
  };

  /**
   * 微信内的引导文案。微信禁止 JS 跳转到外部浏览器，
   * 只能提示用户点右上角菜单手动打开。
   */
  Env.openInBrowserHint = function () {
    if (Env.isIOS) {
      return '点右上角「···」→ 选择「在 Safari 中打开」，即可使用摄像头扫描';
    }
    return '点右上角「···」→ 选择「在浏览器打开」，即可使用摄像头扫描';
  };

  window.AR_ENV = Env;
})();
