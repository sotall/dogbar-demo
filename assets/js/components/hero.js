// Hero Component
(function () {
  const HeroComponent = {
    render(location, config) {
      const root = document.getElementById("hero-root");
      if (!root) return;

      // Use video background if available, otherwise gradient fallback
      const videoPath = `assets/media/videos/hero/${location}-hero.mp4`;
      const backgroundStyle =
        location === "st-pete"
          ? "bg-gradient-to-br from-emerald-600 via-green-500 to-teal-600"
          : "bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600";

      root.innerHTML = `
        <section class="relative h-[600px] overflow-hidden">
          <!-- Video Background -->
          <video
            class="absolute inset-0 w-full h-full object-cover"
            autoplay
            muted
            loop
            playsinline
            onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
          >
            <source src="${videoPath}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
          
          <!-- Gradient Fallback (hidden by default, shown if video fails) -->
          <div class="absolute inset-0 w-full h-full ${backgroundStyle}" style="display: none;"></div>

          <!-- Dark Overlay -->
          <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50"></div>

          <!-- Content -->
          <div class="relative z-10 h-full flex items-center justify-center pt-16">
            <div class="text-center px-4 max-w-4xl mx-auto">
              <!-- Main Heading -->
              <div class="mb-6 animate-fade-in-up">
                <img
                  src="assets/media/dog_bar.png"
                  alt="${config.name || "The Dog Bar"}"
                  class="h-20 md:h-32 mx-auto drop-shadow-2xl"
                />
              </div>

              <!-- CTA Buttons -->
              <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a
                  href="https://dogbarstpete.portal.gingrapp.com/#/public/new_customer"
                  class="px-8 py-4 bg-white/20 backdrop-blur-md text-white font-bold rounded-full hover:bg-white/30 transition-all transform hover:scale-105 shadow-2xl text-lg border-2 border-white/40"
                >
                  🐕 Register Your Dog
                </a>
              </div>
            </div>
          </div>
        </section>
      `;
    },
  };

  // Register component
  window.DogBarComponents.Hero = HeroComponent;
})();
