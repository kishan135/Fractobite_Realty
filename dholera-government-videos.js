(() => {
  'use strict';

  const governmentVideos = [
    {
      youtubeUrl: 'https://youtu.be/VJKx_-3M6ro',
      title: "India's Semiconductor Vision & Dholera",
      description: 'Explore developments and discussion around semiconductor manufacturing in Dholera.',
      thumbnail: null,
      fallbackThumbnail: 'assets/locations/dholera-industrial-concept.webp',
    },
    {
      youtubeUrl: null,
      title: 'Gujarat Semiconductor Development Updates',
      description: "Explore Gujarat's semiconductor initiatives and industrial development.",
      thumbnail: null,
      fallbackThumbnail: 'assets/locations/dholera-planning.webp',
    },
  ];

  const cards = document.querySelector('#dholera-government-videos');
  const template = document.querySelector('#dholera-government-video-card');
  const dialog = document.querySelector('#dholera-video-dialog');
  const title = dialog.querySelector('h2');
  const player = dialog.querySelector('.dholera-video-player');
  const externalLink = dialog.querySelector('a');
  let opener;

  function youtubeId(source) {
    if (!source) return null;
    try {
      const url = new URL(source);
      if (url.protocol !== 'https:') return null;
      const id = url.hostname === 'youtu.be'
        ? url.pathname.slice(1)
        : ['youtube.com', 'www.youtube.com'].includes(url.hostname) && url.pathname === '/watch'
          ? url.searchParams.get('v')
          : null;
      return /^[A-Za-z0-9_-]{11}$/.test(id ?? '') ? id : null;
    } catch {
      return null;
    }
  }

  function openVideo(video, id, button) {
    const iframe = document.createElement('iframe');
    iframe.title = video.title;
    iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    title.textContent = video.title;
    externalLink.href = `https://youtu.be/${id}`;
    player.replaceChildren(iframe);
    opener = button;
    dialog.showModal();
  }

  for (const video of governmentVideos) {
    const card = template.content.cloneNode(true);
    const id = youtubeId(video.youtubeUrl);
    const button = card.querySelector('button');
    const image = card.querySelector('img');
    const illustration = card.querySelector('.dholera-video-illustration');
    const thumbnail = video.thumbnail || (id && `https://i.ytimg.com/vi/${id}/mqdefault.jpg`);
    function showFallback() {
      image.src = video.fallbackThumbnail;
      illustration.hidden = false;
    }
    if (thumbnail) {
      image.addEventListener('error', showFallback, { once: true });
      image.src = thumbnail;
    } else {
      showFallback();
    }
    card.querySelector('h3').textContent = video.title;
    card.querySelector('.dholera-video-description').textContent = video.description;
    card.querySelector('.dholera-video-status').hidden = Boolean(id);
    button.disabled = !id;
    button.setAttribute('aria-label', id ? `Play ${video.title}` : `${video.title} — Coming Soon`);
    if (id) button.addEventListener('click', () => openVideo(video, id, button));
    cards.append(card);
  }

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    player.replaceChildren();
    opener?.focus();
    opener = undefined;
  });
})();
