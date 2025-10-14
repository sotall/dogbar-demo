// Page Hero Utility - Reusable hero section renderer for static pages
// Used by: calendar.html, menu.html, party-booking.html, contact-us.html

/**
 * Renders a customizable hero section with database-driven backgrounds
 * @param {string} page - Page identifier ('events', 'menu', 'parties', 'contact')
 * @param {string} location - Location ('st-pete' or 'sarasota')
 * @param {object} content - Hero content (title, subtitle, buttons, etc.)
 */
async function renderPageHero(page, location, content) {
  const root = document.getElementById(`${page}-hero-root`);
  if (!root) {
    console.warn(`Hero root element #${page}-hero-root not found`);
    return;
  }

  // Try to load custom hero settings from database
  let customSettings = null;
  try {
    const supabaseClient = window.supabase.createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
    
    const { data, error } = await supabaseClient
      .from('page_hero_settings')
      .select('*')
      .eq('location', location)
      .eq('page', page)
      .maybeSingle();

    if (!error && data) {
      customSettings = data;
    }
  } catch (error) {
    console.warn('Could not load custom hero settings, using defaults:', error);
  }

  // Use custom settings if available, otherwise use defaults
  const height = customSettings?.height || 600;
  const mediaUrl = customSettings?.media_url;
  const mediaType = customSettings?.media_type;
  const playbackSpeed = customSettings?.playback_speed || 1.0;

  // Default gradient background
  const defaultGradient = "bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600";
  const backgroundStyle = content.gradientClass || defaultGradient;

  // Build background HTML
  let backgroundHTML = '';
  if (customSettings && mediaUrl) {
    if (mediaType === 'video') {
      backgroundHTML = `
        <video
          class="absolute inset-0 w-full h-full object-cover"
          autoplay
          muted
          loop
          playsinline
          onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
        >
          <source src="${mediaUrl}" type="video/mp4">
        </video>
        <div class="absolute inset-0 w-full h-full ${backgroundStyle}" style="display: none;"></div>
      `;
    } else if (mediaType === 'image') {
      backgroundHTML = `
        <div 
          class="absolute inset-0 w-full h-full bg-cover bg-center"
          style="background-image: url('${mediaUrl}');"
        ></div>
        <div class="absolute inset-0 w-full h-full ${backgroundStyle}" style="display: none;"></div>
      `;
    }
  } else {
    // Use default gradient
    backgroundHTML = `<div class="absolute inset-0 w-full h-full ${backgroundStyle}"></div>`;
  }

  // Build content HTML
  let contentHTML = `
    <div class="container mx-auto px-4 pt-20 text-center">
      <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">${content.title}</h1>
  `;

  if (content.subtitle) {
    contentHTML += `
      <p class="text-xl text-white/90 max-w-2xl mx-auto mb-8">${content.subtitle}</p>
    `;
  }

  if (content.buttons && content.buttons.length > 0) {
    contentHTML += `<div class="flex flex-col sm:flex-row gap-4 justify-center">`;
    content.buttons.forEach(btn => {
      contentHTML += `
        <a
          href="${btn.href}"
          class="${btn.className || 'px-8 py-4 bg-white text-emerald-600 font-bold rounded-full hover:bg-gray-100 transition-colors shadow-lg'}"
        >
          ${btn.text}
        </a>
      `;
    });
    contentHTML += `</div>`;
  }

  contentHTML += `</div>`;

  // Render hero section
  root.innerHTML = `
    <section class="relative overflow-hidden py-16" style="height: ${height}px;">
      <!-- Background -->
      ${backgroundHTML}

      <!-- Overlay (only if using custom media) -->
      ${customSettings && mediaUrl ? '<div class="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50"></div>' : ''}

      <!-- Content -->
      <div class="relative z-10 h-full flex items-center">
        ${contentHTML}
      </div>
    </section>
  `;

  // Set playback speed for videos
  if (mediaType === 'video' && playbackSpeed !== 1.0) {
    setTimeout(() => {
      const video = root.querySelector('video');
      if (video) {
        video.playbackRate = playbackSpeed;
      }
    }, 100);
  }
}

// Make function globally available
window.renderPageHero = renderPageHero;

