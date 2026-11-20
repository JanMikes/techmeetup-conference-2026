/* BUILDING MODERN APIS IN PHP — deck runtime. No dependencies.
   Base: the TechMeetup #43 deck runtime, plus .step reveals and an autoplaying chat. */
(function () {
  'use strict';

  var slides   = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var progress = document.getElementById('progress');
  var counter  = document.getElementById('counter');
  var notes    = document.getElementById('notes');
  var notesBody= document.getElementById('notes-body');
  var help     = document.getElementById('help');
  var jump     = document.getElementById('jump');
  var jumpList = document.getElementById('jump-list');
  var tapPrev  = document.getElementById('tap-prev');
  var tapNext  = document.getElementById('tap-next');
  var total    = slides.length;
  var current  = 0;

  counter.innerHTML = '<span class="cur">1</span> / ' + total;

  /* ---------- theme ---------- */

  function setTheme(light) {
    document.body.classList.toggle('light', light);
    document.documentElement.classList.toggle('light', light);
    try { localStorage.setItem('apis2026-theme', light ? 'light' : 'dark'); } catch (e) {}
  }

  try {
    if (localStorage.getItem('apis2026-theme') === 'light') setTheme(true);
  } catch (e) { /* private window, blocked storage — dark is the default anyway */ }

  /* ---------- jump index, built from the slides themselves ---------- */

  slides.forEach(function (s, n) {
    var h = s.querySelector('h1, h2, h3');
    var act = s.querySelector('.act');
    var li = document.createElement('li');
    li.innerHTML =
      '<span class="i">' + (n + 1) + '</span>' +
      '<span class="t"></span>' +
      '<span class="a"></span>';
    // innerText would collapse <br> correctly, but it falls back to
    // textContent for non-rendered elements — and all but one slide is hidden.
    var tmp = document.createElement('div');
    tmp.innerHTML = h ? h.innerHTML.replace(/<br\s*\/?>/gi, ' ') : '—';
    li.querySelector('.t').textContent =
      tmp.textContent.replace(/\s+/g, ' ').trim();
    li.querySelector('.a').textContent =
      act ? act.textContent.trim() : '';
    li.addEventListener('click', function () {
      closeJump();
      show(n);
    });
    jumpList.appendChild(li);
  });

  function closeJump() { jump.classList.remove('is-open'); }

  function toggleJump() {
    var on = jump.classList.toggle('is-open');
    if (on) {
      Array.prototype.forEach.call(jumpList.children, function (li, n) {
        li.classList.toggle('cur', n === current);
      });
    }
  }


  /* ---------- steps: "next" reveals the next .step on the slide first ---------- */

  function stepsOf(s) { return Array.prototype.slice.call(s.querySelectorAll('.step')); }

  function setSteps(s, allOn) {
    stepsOf(s).forEach(function (el) { el.classList.toggle('on', allOn); });
  }

  /* ---------- autoplay (the Claude Code chat): steps reveal themselves on a timer ----------
     data-delay on a step = ms to wait before it appears (default 900).
     .type steps type their data-text out. "next" during playback finishes it at once.
     data-speed on the slide scales every delay (0.5 = twice as fast); data-type-speed scales only
     the typing (defaults to data-speed). A step with data-hold shows for that many ms (unscaled),
     then hides again - the "Thinking..." indicator. */

  var timers = [];
  var playing = false;

  function stopPlay() {
    timers.forEach(clearTimeout); timers = []; playing = false;
  }

  /* keep the newest line in view, like a real terminal: once the chat is taller than the
     panel, scroll the panel to the bottom after every change */
  function follow(s) {
    var box = s.querySelector('.claude');
    if (box) box.scrollTop = box.scrollHeight;
  }

  function finishPlay(s) {
    stopPlay();
    stepsOf(s).forEach(function (el) {
      if (el.dataset.hold) { el.classList.remove('on'); return; }
      el.classList.add('on');
      if (el.classList.contains('type')) { el.textContent = el.dataset.text; el.classList.remove('caret'); }
    });
    follow(s);
  }

  function typeOut(el, done, k) {
    var text = el.dataset.text, i = 0, s = el.closest('.slide');
    el.textContent = ''; el.classList.add('caret');
    (function tick() {
      i++;
      el.textContent = text.slice(0, i);
      follow(s);
      if (i < text.length) { timers.push(setTimeout(tick, (28 + Math.random() * 45) * k)); }
      else { el.classList.remove('caret'); done(); }
    })();
  }

  function autoplay(s) {
    stopPlay();
    var list = stepsOf(s), n = 0, k = parseFloat(s.dataset.speed || '1');
    var kt = parseFloat(s.dataset.typeSpeed || String(k));
    list.forEach(function (el) { el.classList.remove('on'); if (el.classList.contains('type')) el.textContent = ''; });
    playing = true;
    (function nextStep() {
      if (n >= list.length) { playing = false; return; }
      var el = list[n++];
      timers.push(setTimeout(function () {
        el.classList.add('on');
        follow(s);
        if (el.classList.contains('type')) typeOut(el, nextStep, kt);
        else if (el.dataset.hold) timers.push(setTimeout(function () { el.classList.remove('on'); follow(s); nextStep(); }, parseInt(el.dataset.hold, 10)));
        else nextStep();
      }, parseInt(el.dataset.delay || '900', 10) * k));
    })();
  }

  /* ---------- syntax highlighting: pre.term.php / pre.term.sql ----------
     Runs once at boot. Only plain text is tokenized: anything already wrapped by hand
     (<mark>, .c, .k, .s, .dim) keeps its own colour. */

  var SYNTAX = {
    php: { names: ['com', 'attr', 'str', 'var', 'kw', 'type', 'fn', 'num'],
      rx: new RegExp([
        '(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/|#(?!\\[)[^\\n]*)',
        '(#\\[[A-Za-z_\\\\]+)',
        "('(?:[^'\\\\\\n]|\\\\.)*'|\"(?:[^\"\\\\\\n]|\\\\.)*\")",
        '(\\$[A-Za-z_]\\w*)',
        '\\b(abstract|array|as|bool|catch|class|const|default|else|elseif|enum|extends|false|final|float|fn|for|foreach|function|if|implements|instanceof|int|interface|match|mixed|namespace|never|new|null|private|protected|public|readonly|return|self|static|string|throw|true|try|use|void|while)\\b',
        '(\\b[A-Z][a-z]\\w*(?:\\\\[A-Z]\\w*)*)',
        '(\\b[a-z_]\\w*(?=\\())',
        '(\\b\\d[\\d_]*(?:\\.\\d+)?\\b)'
      ].join('|'), 'g') },
    sql: { names: ['com', 'str', 'var', 'kw', 'num'],
      rx: new RegExp([
        '(--[^\\n]*)',
        "('(?:[^'\\n])*')",
        '(:[A-Za-z_]\\w*)',
        '\\b(SELECT|FROM|WHERE|AND|OR|NOT|ORDER|BY|DESC|ASC|CREATE|INDEX|IF|EXISTS|ON|USING|GIN|ILIKE|LIKE|JOIN|INNER|LEFT|UNION|IN|AS|COUNT|IS|NULL|LIMIT|OFFSET|GROUP)\\b',
        '(\\b\\d+\\b)'
      ].join('|'), 'g') }
  };

  function highlight(pre, lang) {
    var spec = SYNTAX[lang], walker = document.createTreeWalker(pre, NodeFilter.SHOW_TEXT), nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (t) {
      for (var p = t.parentNode; p && p !== pre; p = p.parentNode) {
        if (p.matches('mark, .c, .k, .s, .dim, .syn')) return;
      }
      var s = t.nodeValue, frag = document.createDocumentFragment(), last = 0, m;
      spec.rx.lastIndex = 0;
      while ((m = spec.rx.exec(s))) {
        if (!m[0]) { spec.rx.lastIndex++; continue; }
        var g = 1; while (m[g] === undefined) g++;
        frag.appendChild(document.createTextNode(s.slice(last, m.index)));
        var span = document.createElement('span');
        span.className = 'syn ' + spec.names[g - 1];
        span.textContent = m[0];
        frag.appendChild(span);
        last = spec.rx.lastIndex;
      }
      if (last === 0) return;
      frag.appendChild(document.createTextNode(s.slice(last)));
      t.parentNode.replaceChild(frag, t);
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll('pre.term.php'), function (el) { highlight(el, 'php'); });
  Array.prototype.forEach.call(document.querySelectorAll('pre.term.sql'), function (el) { highlight(el, 'sql'); });

  /* ---------- navigation ---------- */

  function show(i, push, backwards) {
    stopPlay();
    current = Math.max(0, Math.min(total - 1, i));
    var target = slides[current];
    if (target.hasAttribute('data-autoplay') && !backwards) { autoplay(target); }
    else { setSteps(target, !!backwards); }
    slides.forEach(function (s, n) { s.classList.toggle('is-active', n === current); });

    progress.style.width = ((current + 1) / total * 100) + '%';
    counter.innerHTML = '<span class="cur">' + (current + 1) + '</span> / ' + total;

    var src = slides[current].querySelector('.notes-src');
    notesBody.innerHTML = src ? src.innerHTML : '<span style="opacity:.5">no notes for this slide</span>';

    tapPrev.disabled = current === 0;
    tapNext.disabled = current === total - 1;

    if (push !== false) {
      history.replaceState(null, '', '#/' + (current + 1));
    }
  }

  function next() {
    var s = slides[current];
    if (playing) { finishPlay(s); return; }
    var hidden = stepsOf(s).filter(function (el) { return !el.classList.contains('on'); });
    if (hidden.length) {
      /* .with-prev steps appear on the same click as the step before them */
      var i = 0;
      do { hidden[i].classList.add('on'); i++; }
      while (i < hidden.length && hidden[i].classList.contains('with-prev'));
      return;
    }
    if (current < total - 1) show(current + 1);
  }
  function prev() {
    var s = slides[current];
    if (playing) { stopPlay(); }
    if (!s.hasAttribute('data-autoplay')) {
      var shown = stepsOf(s).filter(function (el) { return el.classList.contains('on'); });
      if (shown.length) {
        var j = shown.length - 1;
        while (j > 0 && shown[j].classList.contains('with-prev')) { shown[j].classList.remove('on'); j--; }
        shown[j].classList.remove('on');
        return;
      }
    }
    if (current > 0) show(current - 1, true, true);
  }

  /* ---------- keyboard ---------- */

  var NEXT_KEYS = ['Enter', ' ', 'Spacebar', 'ArrowRight', 'ArrowDown', 'PageDown'];
  var PREV_KEYS = ['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'];

  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    var k = e.key;

    // modal-ish overlays first
    if (k === '?' || (k === '/' && e.shiftKey)) {
      help.classList.toggle('is-open');
      e.preventDefault();
      return;
    }
    if (k === 'Escape') {
      help.classList.remove('is-open');
      closeJump();
      return;
    }

    if (k === 'n' || k === 'N') {
      notes.classList.toggle('is-open');
      e.preventDefault();
      return;
    }
    if (k === 'o' || k === 'O') {
      toggleJump();
      e.preventDefault();
      return;
    }
    if (k === 't' || k === 'T') {
      setTheme(!document.body.classList.contains('light'));
      e.preventDefault();
      return;
    }
    if (k === 'f' || k === 'F') {
      if (document.fullscreenElement) { document.exitFullscreen(); }
      else { document.documentElement.requestFullscreen(); }
      e.preventDefault();
      return;
    }

    if ((k === 'r' || k === 'R') && slides[current].hasAttribute('data-autoplay')) {
      autoplay(slides[current]);
      e.preventDefault();
      return;
    }

    if (k === 'Home') { show(0); e.preventDefault(); return; }
    if (k === 'End')  { show(total - 1); e.preventDefault(); return; }

    if (jump.classList.contains('is-open')) return;

    if (NEXT_KEYS.indexOf(k) > -1) {
      next();
      e.preventDefault();
    } else if (PREV_KEYS.indexOf(k) > -1) {
      prev();
      e.preventDefault();
    }
  });

  /* ---------- pointer ---------- */

  tapPrev.addEventListener('click', prev);
  tapNext.addEventListener('click', next);

  document.addEventListener('click', function (e) {
    // never hijack real controls
    if (e.target.closest('button, a, .notes, .help, .jump, .tapnav, input, textarea')) return;
    if (jump.classList.contains('is-open')) return;
    next();
  });

  // swipe, for the people reading this on a phone from the QR code
  var touchX = null;
  document.addEventListener('touchstart', function (e) {
    touchX = e.changedTouches[0].clientX;
  }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (touchX === null || jump.classList.contains('is-open')) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 60) { dx < 0 ? next() : prev(); }
    touchX = null;
  }, { passive: true });

  /* ---------- a missing image must never show a broken icon on a projector ---------- */

  document.querySelectorAll('.s-image img').forEach(function (img) {
    img.addEventListener('error', function () {
      // Resolve the slide BEFORE detaching the image — closest() on a removed
      // node returns null, which silently left the slide completely blank.
      var slide = img.closest('.s-image');
      img.remove();
      var h = slide && slide.querySelector('.visually-hidden');
      if (h) h.classList.remove('visually-hidden');
    });
  });

  /* ---------- copy button ---------- */

  document.querySelectorAll('.copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.dataset.text;
      if (!text) return;

      navigator.clipboard.writeText(text).then(function () {
        var was = btn.textContent;
        btn.textContent = 'COPIED ✓';
        btn.classList.add('done');
        setTimeout(function () {
          btn.textContent = was;
          btn.classList.remove('done');
        }, 1800);
      });
    });
  });

  /* ---------- boot: honour #/n so a reload keeps your place ---------- */

  var m = /^#\/(\d+)$/.exec(location.hash);
  show(m ? parseInt(m[1], 10) - 1 : 0, false);

  window.addEventListener('hashchange', function () {
    var h = /^#\/(\d+)$/.exec(location.hash);
    if (h) show(parseInt(h[1], 10) - 1, false);
  });
})();
