/* CREATIVE UNIVERSE — vanilla JavaScript interactions */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header: accessible mobile navigation
  const menuToggle = $('#menuToggle');
  const mainNav = $('#mainNav');
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
    mainNav.classList.toggle('open', !isOpen);
  });
  $$('#mainNav a').forEach(link => link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
  }));

  // Dynamic year and scroll progress
  $('#year').textContent = new Date().getFullYear();
  const progress = $('#scrollProgress');
  let scrollTicking = false;
  function updateScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
    const process = $('#processLine');
    if (process) {
      const section = $('.process');
      const rect = section.getBoundingClientRect();
      const visible = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / (rect.height + window.innerHeight * .2)));
      process.style.width = `${visible * 100}%`;
    }
    scrollTicking = false;
  }
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(updateScroll);
      scrollTicking = true;
    }
  }, { passive: true });
  updateScroll();

  // Reveal sections as they enter the viewport.
  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => revealObserver.observe(item));
  } else revealItems.forEach(item => item.classList.add('visible'));

  // Pointer-responsive chrome object and background glow. Disabled for touch/reduced motion.
  const coreWrap = $('#coreWrap');
  const cursorGlow = $('.cursor-glow');
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  if (finePointer && !reduceMotion) {
    document.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse') return;
      if (cursorGlow) {
        cursorGlow.style.opacity = '.9';
        cursorGlow.style.left = `${event.clientX}px`;
        cursorGlow.style.top = `${event.clientY}px`;
      }
      if (coreWrap) {
        const rect = coreWrap.getBoundingClientRect();
        const x = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
        const y = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
        coreWrap.style.transform = `rotateY(${x * 12}deg) rotateX(${-y * 10}deg)`;
      }
    }, { passive: true });
    document.addEventListener('pointerleave', () => {
      if (cursorGlow) cursorGlow.style.opacity = '0';
      if (coreWrap) coreWrap.style.transform = '';
    });
    $$('.magnetic').forEach(button => {
      button.addEventListener('pointermove', event => {
        const rect = button.getBoundingClientRect();
        button.style.transform = `translate(${(event.clientX - rect.left - rect.width / 2) * .08}px, ${(event.clientY - rect.top - rect.height / 2) * .12}px)`;
      });
      button.addEventListener('pointerleave', () => { button.style.transform = ''; });
    });
    $$('.project-open').forEach(card => {
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.transform = `perspective(900px) rotateY(${x * 3}deg) rotateX(${-y * 3}deg) translateY(-3px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  // Portfolio category filters.
  const filterButtons = $$('.filter-btn');
  const projectCards = $$('.project-card');
  filterButtons.forEach(button => button.addEventListener('click', () => {
    filterButtons.forEach(item => item.classList.toggle('active', item === button));
    const filter = button.dataset.filter;
    projectCards.forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('hidden', !match);
      if (match) card.setAttribute('aria-hidden', 'false');
      else card.setAttribute('aria-hidden', 'true');
    });
  }));

  // Accessible project modal.
  const projectModal = $('#projectModal');
  const closeProjectModal = () => {
    if (projectModal.open) projectModal.close();
    document.body.classList.remove('modal-open');
  };
  $$('.project-open').forEach(card => card.addEventListener('click', () => {
    $('#modalCategory').textContent = card.querySelector('.project-category').textContent;
    $('#modalTitle').textContent = card.dataset.title;
    $('#modalDescription').textContent = card.dataset.description;
    $('#modalTools').textContent = card.dataset.tools;
    $('#modalStatus').textContent = card.dataset.status;
    if (typeof projectModal.showModal === 'function') projectModal.showModal();
    else projectModal.setAttribute('open', '');
    document.body.classList.add('modal-open');
  }));
  $('#modalClose').addEventListener('click', closeProjectModal);
  projectModal.addEventListener('close', () => document.body.classList.remove('modal-open'));
  projectModal.addEventListener('click', event => {
    if (event.target === projectModal) closeProjectModal();
  });

  // Story reading view. Replace this demo excerpt in index.html with real writing.
  const readingModal = $('#readingModal');
  const closeReadingModal = () => {
    if (readingModal.open) readingModal.close();
    document.body.classList.remove('modal-open');
  };
  $('#readStoryBtn').addEventListener('click', () => {
    if (typeof readingModal.showModal === 'function') readingModal.showModal();
    else readingModal.setAttribute('open', '');
    document.body.classList.add('modal-open');
  });
  $('#readingClose').addEventListener('click', closeReadingModal);
  readingModal.addEventListener('close', () => document.body.classList.remove('modal-open'));
  readingModal.addEventListener('click', event => {
    if (event.target === readingModal) closeReadingModal();
  });

  // Audio player. A missing file is handled explicitly rather than pretending to play.
  const audio = $('#audioPlayer');
  const playPause = $('#playPause');
  const seek = $('#audioSeek');
  const volume = $('#audioVolume');
  const currentTime = $('#currentTime');
  const duration = $('#duration');
  const audioStatus = $('#audioStatus');
  const visualizer = $('#visualizer');
  for (let i = 0; i < 58; i++) {
    const bar = document.createElement('i');
    bar.style.setProperty('--n', i);
    bar.style.setProperty('--bar', `${4 + ((i * 17 + 11) % 21)}px`);
    visualizer.appendChild(bar);
  }
  audio.volume = Number(volume.value);
  const formatTime = value => {
    if (!Number.isFinite(value)) return '00:00';
    const mins = Math.floor(value / 60);
    const secs = Math.floor(value % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  audio.addEventListener('loadedmetadata', () => {
    duration.textContent = formatTime(audio.duration);
    playPause.disabled = false;
    seek.disabled = false;
    audioStatus.textContent = 'Audio loaded. Press play when you are ready.';
  });
  audio.addEventListener('timeupdate', () => {
    currentTime.textContent = formatTime(audio.currentTime);
    if (Number.isFinite(audio.duration) && audio.duration > 0) seek.value = String((audio.currentTime / audio.duration) * 100);
  });
  audio.addEventListener('play', () => {
    playPause.textContent = 'Ⅱ';
    playPause.setAttribute('aria-label', 'Pause audio');
    visualizer.classList.add('playing');
  });
  audio.addEventListener('pause', () => {
    playPause.textContent = '▶';
    playPause.setAttribute('aria-label', 'Play audio');
    visualizer.classList.remove('playing');
  });
  audio.addEventListener('ended', () => { seek.value = '0'; });
  audio.addEventListener('error', () => {
    playPause.disabled = true;
    seek.disabled = true;
    audioStatus.textContent = 'Placeholder media is missing. Add assets/audio/vocal-demo.mp3 and refresh.';
  });
  playPause.addEventListener('click', async () => {
    if (audio.paused) {
      try { await audio.play(); }
      catch { audioStatus.textContent = 'Playback could not start. Check the audio file path and format.'; }
    } else audio.pause();
  });
  seek.addEventListener('input', () => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) audio.currentTime = (Number(seek.value) / 100) * audio.duration;
  });
  volume.addEventListener('input', () => { audio.volume = Number(volume.value); });
  // Do not rely on a missing source firing an error before the user interacts.
  if (!audio.querySelector('source')?.getAttribute('src')) {
    playPause.disabled = true;
    seek.disabled = true;
  }

  // Web3 topic panels.
  const topics = {
    fundamentals: ['Blockchain fundamentals', 'Understanding how shared state, cryptographic hashes, and consensus fit together—before building on top of them.'],
    solidity: ['Solidity & smart contracts', 'Exploring contract structure, state, functions, events, and the security habits needed before deploying code.'],
    identity: ['Wallets & digital identity', 'Considering how wallets, keys, and user-controlled identity shape participation across digital spaces.'],
    ownership: ['NFTs & digital ownership', 'Investigating provenance, access, and the promises and limitations of tokenized creative assets.'],
    intersection: ['AI × Blockchain', 'Exploring open questions around provenance, attribution, coordination, and responsible creative tooling.']
  };
  $$('.topic-card').forEach(button => button.addEventListener('click', () => {
    $$('.topic-card').forEach(item => item.classList.toggle('active', item === button));
    const [title, description] = topics[button.dataset.topic];
    $('#topicDetail h3').textContent = title;
    $('#topicDetail p:not(.eyebrow)').textContent = description;
  }));

  // Toolkit interactive detail.
  const toolDetails = {
    production: ['01 / CREATIVE PRODUCTION', 'Ideas become visuals through experimentation, art direction, and a willingness to test unexpected approaches.', ['AI-assisted creativity', 'Visual narrative', 'Creative research']],
    storytelling: ['02 / STORYTELLING', 'Character, setting, and narrative are the building blocks of fictional worlds that feel emotionally real.', ['Fiction writing', 'Character development', 'World-building']],
    audio: ['03 / AUDIO', 'A space for vocal performance, vocal layering, and collaborative work that supports a larger creative vision.', ['Vocal performance', 'Vocal layering', 'Behind-the-scenes work']],
    technology: ['04 / EMERGING TECHNOLOGY', 'An evolving learning path through decentralized systems, smart contracts, and the possibilities they may open for creators.', ['Web3 fundamentals', 'Solidity concepts', 'dApp exploration']]
  };
  $$('.tool-tile').forEach(button => button.addEventListener('click', () => {
    $$('.tool-tile').forEach(item => item.classList.toggle('active', item === button));
    const [label, copy, tags] = toolDetails[button.dataset.tool];
    $('#toolDetail .eyebrow').textContent = label;
    $('#toolDetail p').textContent = copy;
    const tagContainer = $('#toolDetail .tool-tags');
    tagContainer.replaceChildren(...tags.map(tag => {
      const span = document.createElement('span');
      span.textContent = tag;
      return span;
    }));
  }));

  // Animated network illustration on canvas (decorative simulation only).
  const canvas = $('#networkCanvas');
  const ctx = canvas.getContext?.('2d');
  const networkPanel = $('.network-panel');
  let nodes = [];
  let canvasWidth = 0;
  let canvasHeight = 0;
  let pointer = { x: -1000, y: -1000 };
  let animationFrame = null;
  function seedNodes() {
    const count = window.innerWidth < 600 ? 16 : 24;
    nodes = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      vx: (Math.random() - .5) * .28,
      vy: (Math.random() - .5) * .28,
      r: i % 6 === 0 ? 3.2 : 2
    }));
    $('#nodeCount').textContent = String(nodes.length);
  }
  function resizeCanvas() {
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasWidth = Math.max(1, rect.width);
    canvasHeight = Math.max(1, rect.height);
    canvas.width = Math.round(canvasWidth * dpr);
    canvas.height = Math.round(canvasHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedNodes();
    drawNetwork(true);
  }
  function drawNetwork(staticOnly = false) {
    if (!ctx || !canvasWidth || !canvasHeight) return;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    // faint technical grid
    ctx.strokeStyle = 'rgba(130,220,255,.055)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvasWidth; x += 32) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvasHeight); ctx.stroke();
    }
    for (let y = 0; y < canvasHeight; y += 32) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvasWidth, y); ctx.stroke();
    }
    nodes.forEach((node, i) => {
      if (!staticOnly && !reduceMotion) {
        node.x += node.vx; node.y += node.vy;
        if (node.x < 0 || node.x > canvasWidth) node.vx *= -1;
        if (node.y < 0 || node.y > canvasHeight) node.vy *= -1;
      }
      const dx = node.x - pointer.x, dy = node.y - pointer.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 100 && !reduceMotion) {
        node.x += dx / Math.max(distance, 1) * .25;
        node.y += dy / Math.max(distance, 1) * .25;
      }
      for (let j = i + 1; j < nodes.length; j++) {
        const other = nodes[j];
        const gap = Math.hypot(node.x - other.x, node.y - other.y);
        if (gap < 115) {
          ctx.strokeStyle = `rgba(111,211,255,${(1 - gap / 115) * .32})`;
          ctx.beginPath(); ctx.moveTo(node.x, node.y); ctx.lineTo(other.x, other.y); ctx.stroke();
        }
      }
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fillStyle = i % 5 === 0 ? '#b995ff' : '#80ddff';
      ctx.shadowBlur = 10;
      ctx.shadowColor = i % 5 === 0 ? '#a45cff' : '#77d7ff';
      ctx.fill();
      ctx.shadowBlur = 0;
    });
    if (!staticOnly && !reduceMotion) animationFrame = requestAnimationFrame(() => drawNetwork(false));
  }
  if (ctx) {
    const canvasObserver = new IntersectionObserver(entries => {
      const visible = entries.some(entry => entry.isIntersecting);
      if (visible && !reduceMotion && !animationFrame) drawNetwork(false);
      else if (!visible && animationFrame) { cancelAnimationFrame(animationFrame); animationFrame = null; }
      if (visible && reduceMotion) drawNetwork(true);
    }, { threshold: .05 });
    canvasObserver.observe(networkPanel);
    canvas.addEventListener('pointermove', event => {
      const rect = canvas.getBoundingClientRect();
      pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    });
    canvas.addEventListener('pointerleave', () => { pointer = { x: -1000, y: -1000 }; });
    if ('ResizeObserver' in window) new ResizeObserver(resizeCanvas).observe(canvas);
    else window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
  }

  // Contact form: validate locally, then open a prefilled email draft. No data is uploaded.
  const form = $('#contactForm');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const setError = (id, message) => { $(`#${id}`).textContent = message; };
  form.addEventListener('submit', event => {
    event.preventDefault();
    const name = $('#name').value.trim();
    const email = $('#email').value.trim();
    const projectType = $('#projectType').value;
    const message = $('#message').value.trim();
    let valid = true;
    setError('nameError', '');
    setError('emailError', '');
    setError('messageError', '');
    if (name.length < 2) { setError('nameError', 'Please enter at least 2 characters.'); valid = false; }
    if (!emailPattern.test(email)) { setError('emailError', 'Please enter a valid email address.'); valid = false; }
    if (message.length < 10) { setError('messageError', 'Please add a little more detail (at least 10 characters).'); valid = false; }
    if (!projectType) { $('#projectType').setCustomValidity('Please choose a collaboration type.'); $('#projectType').reportValidity(); valid = false; }
    else $('#projectType').setCustomValidity('');
    if (!valid) {
      $('#formFeedback').textContent = 'A few details need attention before the message is ready.';
      return;
    }
    const subject = encodeURIComponent(`Portfolio collaboration: ${projectType}`);
    const body = encodeURIComponent(`Hello,\n\nMy name is ${name}.\nEmail: ${email}\nCollaboration: ${projectType}\n\n${message}\n`);
    $('#formFeedback').textContent = 'Your details are validated. Opening your email app with a prepared draft; nothing has been sent by this website.';
    window.location.href = `mailto:hello@example.com?subject=${subject}&body=${body}`;
  });
  $$('#contactForm input, #contactForm textarea, #contactForm select').forEach(field => {
    field.addEventListener('input', () => {
      if (field.id === 'name' && field.value.trim().length >= 2) setError('nameError', '');
      if (field.id === 'email' && emailPattern.test(field.value.trim())) setError('emailError', '');
      if (field.id === 'message' && field.value.trim().length >= 10) setError('messageError', '');
    });
  });
  // Placeholder social links must not send visitors to an unrelated destination.
  $$('[data-placeholder-link]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    const feedback = $('#formFeedback');
    feedback.textContent = 'Social link placeholder: add your real profile URL in index.html.';
    $('#contactForm').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  }));
})();
