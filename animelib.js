(function () {
  const PROXY_PREFIX = 'https://wild-mode-68f9.edikgarr.workers.dev/';
  const COVER_HOST = 'https://cover.imglib.info/';

  if (window.__lampaCoverProxy) {
    console.log('cover-proxy: already installed');
    return;
  }
  window.__lampaCoverProxy = true;

  function isCoverUrl(u) {
    return typeof u === 'string' && u.indexOf(COVER_HOST) !== -1 && u.indexOf(PROXY_PREFIX) !== 0;
  }

  function proxifyUrl(u) {
    if (!isCoverUrl(u)) return u;
    const idx = u.indexOf(COVER_HOST);
    return u.slice(0, idx) + PROXY_PREFIX + u.slice(idx);
  }

  function proxifyCssUrls(cssText) {
    if (typeof cssText !== 'string') return cssText;
    return cssText.replace(/url\(\s*(['"]?)(https?:\/\/cover\.imglib\.info\/[^'")]+)\1\s*\)/gi,
      (m, quote, url) => 'url(' + (quote || '') + proxifyUrl(url) + (quote || '') + ')'
    );
  }

  function proxifyHtmlString(html) {
    if (typeof html !== 'string') return html;
    return html.replace(/https?:\/\/cover\.imglib\.info\/[^\s"'()<>]+/gi, (m) => proxifyUrl(m));
  }

  function processElement(el) {
    try {
      if (!el || el.nodeType !== 1) return;

      const tag = el.tagName && el.tagName.toLowerCase();

      // <img>
      if (tag === 'img') {
        try {
          if (isCoverUrl(el.src)) el.src = proxifyUrl(el.src);
        } catch (e) {}
        try {
          const ss = el.getAttribute('srcset');
          if (ss && ss.indexOf(COVER_HOST) !== -1) {
            el.setAttribute('srcset', ss.replace(/https?:\/\/cover\.imglib\.info\/[^,\s]+/gi, m => proxifyUrl(m)));
          }
        } catch (e) {}
      }

      // <source> (picture)
      if (tag === 'source') {
        try {
          const s = el.src || el.getAttribute('src');
          if (isCoverUrl(s)) el.src = proxifyUrl(s);
        } catch (e) {}
        try {
          const ss = el.getAttribute('srcset');
          if (ss && ss.indexOf(COVER_HOST) !== -1) {
            el.setAttribute('srcset', ss.replace(/https?:\/\/cover\.imglib\.info\/[^,\s]+/gi, m => proxifyUrl(m)));
          }
        } catch (e) {}
      }

      // <link rel=preload href=...>
      if (tag === 'link') {
        try {
          const rel = (el.rel || '').toLowerCase();
          if (rel.indexOf('preload') !== -1 || rel.indexOf('image') !== -1) {
            if (isCoverUrl(el.href)) el.href = proxifyUrl(el.href);
          }
        } catch (e) {}
      }

      // inline style attribute
      try {
        const styleAttr = el.getAttribute && el.getAttribute('style');
        if (styleAttr && styleAttr.indexOf(COVER_HOST) !== -1) {
          el.setAttribute('style', proxifyCssUrls(styleAttr));
        }
      } catch (e) {}

      // computed style background-image set via element.style
      try {
        const bg = el.style && (el.style.backgroundImage || el.style.background || '');
        if (bg && bg.indexOf(COVER_HOST) !== -1) {
          el.style.backgroundImage = proxifyCssUrls(el.style.backgroundImage || el.style.background);
        }
      } catch (e) {}
    } catch (e) {
      // silent
    }
  }

  // === 1) override Image.src and srcset setters ===
  try {
    const imgProto = HTMLImageElement && HTMLImageElement.prototype;
    if (imgProto) {
      const srcDesc = Object.getOwnPropertyDescriptor(imgProto, 'src') ||
                      Object.getOwnPropertyDescriptor(Image.prototype, 'src');
      if (srcDesc && srcDesc.set) {
        Object.defineProperty(imgProto, 'src', {
          configurable: true,
          enumerable: true,
          get() { return srcDesc.get.call(this); },
          set(v) {
            try { if (isCoverUrl(v)) v = proxifyUrl(v); } catch (e) {}
            return srcDesc.set.call(this, v);
          }
        });
      }

      const srcsetDesc = Object.getOwnPropertyDescriptor(imgProto, 'srcset');
      if (srcsetDesc && srcsetDesc.set) {
        Object.defineProperty(imgProto, 'srcset', {
          configurable: true,
          enumerable: true,
          get() { return srcsetDesc.get.call(this); },
          set(v) {
            try {
              if (typeof v === 'string' && v.indexOf(COVER_HOST) !== -1) {
                v = v.replace(/https?:\/\/cover\.imglib\.info\/[^,\s]+/gi, m => proxifyUrl(m));
              }
            } catch (e) {}
            return srcsetDesc.set.call(this, v);
          }
        });
      }
    }
  } catch (e) {}

  // === 2) override Element.setAttribute (catch src/srcset/style inserted via attributes) ===
  try {
    const origSetAttr = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function (name, value) {
      try {
        const ln = String(name).toLowerCase();
        if ((ln === 'src' || ln === 'data-src') && isCoverUrl(value)) value = proxifyUrl(String(value));
        else if (ln === 'srcset' && typeof value === 'string' && value.indexOf(COVER_HOST) !== -1) {
          value = value.replace(/https?:\/\/cover\.imglib\.info\/[^,\s]+/gi, m => proxifyUrl(m));
        } else if (ln === 'style' && typeof value === 'string' && value.indexOf(COVER_HOST) !== -1) {
          value = proxifyCssUrls(value);
        } else if (ln === 'href' && this.tagName && this.tagName.toLowerCase() === 'link' && typeof value === 'string' && value.indexOf(COVER_HOST) !== -1) {
          value = proxifyUrl(value);
        }
      } catch (e) {}
      return origSetAttr.call(this, name, value);
    };
  } catch (e) {}

  // === 3) override innerHTML / insertAdjacentHTML (catch bulk HTML insertion) ===
  try {
    const innerDesc = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
    if (innerDesc && innerDesc.set) {
      Object.defineProperty(Element.prototype, 'innerHTML', {
        configurable: true,
        enumerable: true,
        get() { return innerDesc.get.call(this); },
        set(html) {
          try { if (typeof html === 'string' && html.indexOf(COVER_HOST) !== -1) html = proxifyHtmlString(html); } catch (e) {}
          return innerDesc.set.call(this, html);
        }
      });
    }
  } catch (e) {}

  try {
    const origInsert = Element.prototype.insertAdjacentHTML;
    Element.prototype.insertAdjacentHTML = function (pos, str) {
      try { if (typeof str === 'string' && str.indexOf(COVER_HOST) !== -1) str = proxifyHtmlString(str); } catch (e) {}
      return origInsert.call(this, pos, str);
    };
  } catch (e) {}

  // === 4) override CSS style setters where possible: setProperty + backgroundImage setter ===
  try {
    const origSetProp = CSSStyleDeclaration.prototype.setProperty;
    CSSStyleDeclaration.prototype.setProperty = function (prop, value, priority) {
      try {
        if (prop && prop.toLowerCase().indexOf('background') !== -1 && typeof value === 'string' && value.indexOf(COVER_HOST) !== -1) {
          value = proxifyCssUrls(value);
        }
      } catch (e) {}
      return origSetProp.call(this, prop, value, priority);
    };
  } catch (e) {}

  try {
    const bgDesc = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, 'backgroundImage');
    if (bgDesc && bgDesc.set) {
      Object.defineProperty(CSSStyleDeclaration.prototype, 'backgroundImage', {
        configurable: true,
        enumerable: true,
        get() { return bgDesc.get.call(this); },
        set(v) {
          try { if (typeof v === 'string' && v.indexOf(COVER_HOST) !== -1) v = proxifyCssUrls(v); } catch (e) {}
          return bgDesc.set.call(this, v);
        }
      });
    }
  } catch (e) {}

  // === 5) override fetch / XHR (in case images are requested via JS) ===
  try {
    const origFetch = window.fetch;
    window.fetch = function (input, init) {
      try {
        if (typeof input === 'string' && input.indexOf(COVER_HOST) !== -1) {
          input = proxifyUrl(input);
        } else if (input && input.url && typeof input.url === 'string' && input.url.indexOf(COVER_HOST) !== -1) {
          // clone request with new url
          const newUrl = proxifyUrl(input.url);
          input = new Request(newUrl, input);
        }
      } catch (e) {}
      return origFetch.call(this, input, init);
    };
  } catch (e) {}

  try {
    const origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url /*, ... */) {
      try {
        if (typeof url === 'string' && url.indexOf(COVER_HOST) !== -1) {
          arguments[1] = proxifyUrl(url); // modify the url argument
        }
      } catch (e) {}
      return origOpen.apply(this, arguments);
    };
  } catch (e) {}

  // === 6) MutationObserver fallback (catch anything missed) ===
  try {
    const observer = new MutationObserver(muts => {
      for (const m of muts) {
        if (m.type === 'childList') {
          m.addedNodes.forEach(node => {
            if (node.nodeType !== 1) return;
            processElement(node);
            // walk subtree
            node.querySelectorAll && node.querySelectorAll('*').forEach(processElement);
          });
        } else if (m.type === 'attributes') {
          processElement(m.target);
        }
      }
    });

    observer.observe(document.documentElement || document, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'srcset', 'style', 'href']
    });

    // initial pass
    document.querySelectorAll && document.querySelectorAll('img,source,link').forEach(processElement);
    document.querySelectorAll && document.querySelectorAll('[style]').forEach(processElement);
  } catch (e) {}

  console.log('cover-proxy: installed — will proxify', COVER_HOST, '->', PROXY_PREFIX);
})();
