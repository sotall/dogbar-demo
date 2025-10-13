// Location Chooser Component (Placeholder - not needed in new architecture)
(function () {
  const LocationChooserComponent = {
    render(location) {
      // In the new architecture, location switching is handled by the URL parameter
      // Users can switch by going back to index.html or using the header links
      // This component is kept for compatibility but does nothing
    },
  };

  // Register component
  window.DogBarComponents.LocationChooser = LocationChooserComponent;
})();
