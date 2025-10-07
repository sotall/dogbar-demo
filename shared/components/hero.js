// Hero Component
(function () {
  const HeroComponent = {
    render(location, config) {
      const root = document.getElementById("hero-root");
      if (!root) return;

      const videoPath =
        location === "st-pete"
          ? "uploads/dogbar-st.pete.mp4"
          : "uploads/2025/01/dogbar-sarasota.mp4";

      root.innerHTML = `
        <section class="relative h-[600px] overflow-hidden">
          <!-- Video Background -->
          <video
            autoplay
            muted
            loop
            playsinline
            class="absolute inset-0 w-full h-full object-cover"
            id="heroVideo"
          >
            <source src="${videoPath}" type="video/mp4" />
            <img
              src="uploads/2019/12/video_cover.png"
              alt="Dog Bar ${location === "st-pete" ? "St. Pete" : "Sarasota"}"
              class="w-full h-full object-cover"
            />
          </video>

          <!-- Dark Overlay -->
          <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50"></div>

          <!-- Content -->
          <div class="relative z-10 h-full flex items-center justify-center">
            <div class="text-center px-4 max-w-4xl mx-auto">
              <!-- Main Heading -->
              <h2 class="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl animate-fade-in-up">
                ${config.name || "The Dog Bar"}
              </h2>
              
              <!-- Subtitle -->
              <p class="text-2xl md:text-3xl text-white/95 mb-12 drop-shadow-lg font-medium">
                ${config.subtitle || "Florida's Premier Dog Park & Bar"}
              </p>

              <!-- CTA Buttons -->
              <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a
                  href="https://dogbarstpete.portal.gingrapp.com/#/public/new_customer"
                  class="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-full hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 shadow-2xl text-lg backdrop-blur-sm border-2 border-white/20"
                >
                  🐕 Register Your Dog
                </a>
                <a
                  href="#about"
                  class="px-8 py-4 bg-white/20 backdrop-blur-md text-white font-bold rounded-full hover:bg-white/30 transition-all transform hover:scale-105 shadow-2xl text-lg border-2 border-white/40"
                >
                  Learn More
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
