// Events Component
window.DogBarComponents = window.DogBarComponents || {};

const EventsComponent = {
  // Get upcoming events from Supabase
  async getUpcomingEvents(limit = 2) {
    try {
      // Get Supabase client from global app
      const app = window.DogBarApp;
      if (!app || !app.getSupabase()) {
        console.warn("Supabase not available, using fallback data");
        return EventsComponent.getFallbackEvents(limit);
      }

      const supabase = app.getSupabase();
      const location = app.getLocation();

      // Fetch upcoming events from database
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("location", location)
        .eq("status", "published")
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true })
        .limit(limit);

      if (error) {
        console.error("Error fetching events from database:", error);
        return EventsComponent.getFallbackEvents(limit);
      }

      // Transform database events to expected format
      return data.map((event) => ({
        title: event.title,
        time: `${event.start_time || "TBD"} - ${event.end_time || "TBD"}`,
        description: event.description || "Join us for this exciting event!",
        image:
          event.image_url ||
          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkV2ZW50IEltYWdlPC90ZXh0Pjwvc3ZnPg==",
        type: EventsComponent.getEventType(event.event_type),
        date: new Date(event.date),
        dateStr: event.date,
      }));
    } catch (error) {
      console.error("Error in getUpcomingEvents:", error);
      return EventsComponent.getFallbackEvents(limit);
    }
  },

  // Get featured events from Supabase
  async getFeaturedEvents(limit = 2) {
    try {
      // Get Supabase client from global app
      const app = window.DogBarApp;
      if (!app || !app.getSupabase()) {
        console.warn("Supabase not available for featured events");
        return [];
      }

      const supabase = app.getSupabase();
      const location = app.getLocation();

      // Fetch featured events from database
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("location", location)
        .eq("status", "published")
        .eq("is_featured", true)
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true })
        .limit(limit);

      if (error) {
        console.error("Error fetching featured events from database:", error);
        return [];
      }

      // Transform database events to expected format
      return data.map((event) => ({
        title: event.title,
        time: `${event.start_time || "TBD"} - ${event.end_time || "TBD"}`,
        description: event.description || "Join us for this exciting event!",
        image:
          event.image_url ||
          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkV2ZW50IEltYWdlPC90ZXh0Pjwvc3ZnPg==",
        type: EventsComponent.getEventType(event.event_type),
        date: new Date(event.date),
        dateStr: event.date,
      }));
    } catch (error) {
      console.error("Error in getFeaturedEvents:", error);
      return [];
    }
  },

  getEventType(eventType) {
    const typeMap = {
      "food-truck": "Food Truck",
      special: "Special Event",
      recurring: "Entertainment",
      wellness: "Wellness",
    };
    return typeMap[eventType] || "Event";
  },

  // Fallback events data (original hardcoded data)
  getFallbackEvents(limit = 2) {
    const eventsData = {
      // October 2025
      "2025-10-03": [
        {
          title: "Food Truck Friday - Latin Lunchbox",
          time: "5:00 PM - 9:00 PM",
          description: "Delicious Latin cuisine from Latin Lunchbox food truck",
          image: "uploads/2025/08/latin_lunchbox_menu_820x1024.jpg",
          type: "Food Truck",
        },
      ],
      "2025-10-05": [
        {
          title: "Yoga with Pups",
          time: "10:00 AM - 11:00 AM",
          description:
            "First Sunday monthly yoga session with your furry friend",
          image:
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkV2ZW50IEltYWdlPC90ZXh0Pjwvc3ZnPg==",
          type: "Wellness",
        },
      ],
      "2025-10-06": [
        {
          title: "Trivia Night",
          time: "7:00 PM - 9:00 PM",
          description: "Every Monday - Test your knowledge and win prizes!",
          image:
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkV2ZW50IEltYWdlPC90ZXh0Pjwvc3ZnPg==",
          type: "Entertainment",
        },
      ],
      "2025-10-07": [
        {
          title: "Bingo Night",
          time: "6:30 PM - 9:30 PM",
          description: "Fun bingo with prizes for you and your pup!",
          image:
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkV2ZW50IEltYWdlPC90ZXh0Pjwvc3ZnPg==",
          type: "Entertainment",
        },
      ],
      "2025-10-10": [
        {
          title: "Food Truck Friday - Poke 'Em",
          time: "5:00 PM - 9:00 PM",
          description: "Fresh poke bowls and Hawaiian cuisine",
          image: "uploads/2025/09/poke_em_menu_no_prices_1_791x1024.png",
          type: "Food Truck",
        },
      ],
      "2025-10-13": [
        {
          title: "Trivia Night",
          time: "7:00 PM - 9:00 PM",
          description: "Every Monday - Test your knowledge and win prizes!",
          image:
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkV2ZW50IEltYWdlPC90ZXh0Pjwvc3ZnPg==",
          type: "Entertainment",
        },
      ],
      "2025-10-14": [
        {
          title: "Bingo Night",
          time: "6:30 PM - 9:30 PM",
          description: "Fun bingo with prizes for you and your pup!",
          image:
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkV2ZW50IEltYWdlPC90ZXh0Pjwvc3ZnPg==",
          type: "Entertainment",
        },
      ],
      "2025-10-17": [
        {
          title: "Food Truck Friday - Go Stuff Urself",
          time: "5:00 PM - 9:00 PM",
          description: "Amazing wings and loaded fries",
          image: "uploads/2024/06/go_stuff_urself_menu_798x1024.jpg",
          type: "Food Truck",
        },
      ],
      "2025-10-20": [
        {
          title: "Trivia Night",
          time: "7:00 PM - 9:00 PM",
          description: "Every Monday - Test your knowledge and win prizes!",
          image:
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkV2ZW50IEltYWdlPC90ZXh0Pjwvc3ZnPg==",
          type: "Entertainment",
        },
      ],
      "2025-10-21": [
        {
          title: "Bingo Night",
          time: "6:30 PM - 9:30 PM",
          description: "Fun bingo with prizes for you and your pup!",
          image:
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkV2ZW50IEltYWdlPC90ZXh0Pjwvc3ZnPg==",
          type: "Entertainment",
        },
      ],
      "2025-10-24": [
        {
          title: "Food Truck Friday - Saucin Wings",
          time: "5:00 PM - 9:00 PM",
          description: "The best wings in Tampa Bay!",
          image: "uploads/2023/04/saucin_wings_menu_1_683x1024.png",
          type: "Food Truck",
        },
      ],
      "2025-10-27": [
        {
          title: "Trivia Night",
          time: "7:00 PM - 9:00 PM",
          description: "Every Monday - Test your knowledge and win prizes!",
          image:
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkV2ZW50IEltYWdlPC90ZXh0Pjwvc3ZnPg==",
          type: "Entertainment",
        },
      ],
      "2025-10-28": [
        {
          title: "Bingo Night",
          time: "6:30 PM - 9:30 PM",
          description: "Fun bingo with prizes for you and your pup!",
          image:
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkV2ZW50IEltYWdlPC90ZXh0Pjwvc3ZnPg==",
          type: "Entertainment",
        },
      ],
      "2025-10-31": [
        {
          title: "Halloween Howl-o-ween Party 🎃",
          time: "5:00 PM - 10:00 PM",
          description:
            "Costume contest, treats, and spooky fun for dogs and their humans!",
          image:
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkV2ZW50IEltYWdlPC90ZXh0Pjwvc3ZnPg==",
          type: "Special Event",
        },
      ],
      // November 2025
      "2025-11-02": [
        {
          title: "Yoga with Pups",
          time: "10:00 AM - 11:00 AM",
          description: "First Sunday monthly yoga session",
          image:
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkV2ZW50IEltYWdlPC90ZXh0Pjwvc3ZnPg==",
          type: "Wellness",
        },
      ],
      "2025-11-03": [
        {
          title: "Trivia Night",
          time: "7:00 PM - 9:00 PM",
          description: "Every Monday - Test your knowledge!",
          image:
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkV2ZW50IEltYWdlPC90ZXh0Pjwvc3ZnPg==",
          type: "Entertainment",
        },
      ],
      "2025-11-07": [
        {
          title: "Food Truck Friday - Johnny Nevada's",
          time: "5:00 PM - 9:00 PM",
          description: "Gourmet tacos and Mexican street food",
          image: "uploads/2023/03/johnny_nevadas_menu_3.16_1024x577.png",
          type: "Food Truck",
        },
      ],
      "2025-11-10": [
        {
          title: "Trivia Night",
          time: "7:00 PM - 9:00 PM",
          description: "Every Monday - Test your knowledge!",
          image:
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkV2ZW50IEltYWdlPC90ZXh0Pjwvc3ZnPg==",
          type: "Entertainment",
        },
      ],
      "2025-11-14": [
        {
          title: "Food Truck Friday - Got Lobstah",
          time: "5:00 PM - 9:00 PM",
          description: "Fresh lobster rolls and seafood",
          image: "uploads/2021/04/got_lobstah_menu_2_298x400.jpg",
          type: "Food Truck",
        },
      ],
      "2025-11-17": [
        {
          title: "Trivia Night",
          time: "7:00 PM - 9:00 PM",
          description: "Every Monday - Test your knowledge!",
          image:
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkV2ZW50IEltYWdlPC90ZXh0Pjwvc3ZnPg==",
          type: "Entertainment",
        },
      ],
      "2025-11-21": [
        {
          title: "Food Truck Friday - Polish Kitchen",
          time: "5:00 PM - 9:00 PM",
          description: "Authentic Polish pierogis and kielbasa",
          image:
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkV2ZW50IEltYWdlPC90ZXh0Pjwvc3ZnPg==",
          type: "Food Truck",
        },
      ],
      "2025-11-24": [
        {
          title: "Trivia Night",
          time: "7:00 PM - 9:00 PM",
          description: "Every Monday - Test your knowledge!",
          image:
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkV2ZW50IEltYWdlPC90ZXh0Pjwvc3ZnPg==",
          type: "Entertainment",
        },
      ],
      "2025-11-28": [
        {
          title: "Food Truck Friday - Thanksgiving Weekend",
          time: "5:00 PM - 9:00 PM",
          description: "Special Thanksgiving weekend food truck",
          image:
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkV2ZW50IEltYWdlPC90ZXh0Pjwvc3ZnPg==",
          type: "Food Truck",
        },
      ],
    };
  },

  async render(location, config) {
    const root = document.getElementById("events-root");
    if (!root) return;

    // Show loading state
    root.innerHTML = `
        <section id="events" class="py-20 bg-gray-50">
          <div class="container mx-auto px-4">
            <div class="text-center mb-12">
              <h2 class="text-4xl font-bold text-gray-900 mb-4">Upcoming Events 📅</h2>
              <p class="text-lg text-gray-600 mb-8">Loading events...</p>
            </div>
            <div class="flex justify-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          </div>
        </section>
      `;

    // Get upcoming events from database
    const upcomingEvents = await EventsComponent.getUpcomingEvents(2);

    const eventsHTML = upcomingEvents
      .map(
        (event, index) => `
        <div class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group event-card" data-event-index="${index}">
          <div class="relative cursor-pointer" onclick="toggleEventDetails(${index})">
          <img
            src="${event.image}"
            alt="${event.title}"
              class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div class="absolute top-4 right-4">
              <span class="px-3 py-1 text-xs font-semibold rounded-full ${
                event.type === "Special Event"
                  ? "bg-red-100 text-red-800"
                  : event.type === "Wellness"
                  ? "bg-purple-100 text-purple-800"
                  : event.type === "Food Truck"
                  ? "bg-orange-100 text-orange-800"
                  : "bg-emerald-100 text-emerald-800"
              }">
                ${event.type}
              </span>
            </div>
            <div class="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
              <span class="text-sm font-semibold text-gray-900">
                ${event.date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <div class="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-full p-2">
              <svg class="w-5 h-5 text-white transition-transform duration-300 expand-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
          <div class="p-6">
            <h3 class="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
              ${event.title}
            </h3>
            <p class="text-emerald-600 font-semibold mb-3 flex items-center">
              <span class="mr-2">🕐</span>
              ${event.time}
            </p>
            <p class="text-gray-600 leading-relaxed">${event.description}</p>
            
            <!-- Expandable Details Section -->
            <div class="event-details mt-4 pt-4 border-t border-gray-100 hidden">
              <div class="space-y-4">
                <div class="flex items-center text-sm text-gray-600">
                  <span class="text-emerald-600 mr-3">📅</span>
                  <span><strong>Date:</strong> ${event.date.toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}</span>
                </div>
                <div class="flex items-center text-sm text-gray-600">
                  <span class="text-emerald-600 mr-3">📍</span>
                  <span><strong>Location:</strong> The Dog Bar - ${
                    location === "st-pete" ? "St. Pete" : "Sarasota"
                  }</span>
                </div>
                <div class="flex items-center text-sm text-gray-600">
                  <span class="text-emerald-600 mr-3">💰</span>
                  <span><strong>Cost:</strong> Free Entry</span>
                </div>
                <div class="flex items-center text-sm text-gray-600">
                  <span class="text-emerald-600 mr-3">👥</span>
                  <span><strong>Capacity:</strong> Open to all members</span>
                </div>
                <div class="flex items-center text-sm text-gray-600">
                  <span class="text-emerald-600 mr-3">🐕</span>
                  <span><strong>Requirements:</strong> Dogs must be registered members</span>
                </div>
              </div>
              
              <div class="mt-6 space-y-3">
                <button 
                  onclick="window.open('tel:${
                    location === "st-pete" ? "727-317-3647" : "941-555-0123"
                  }')"
                  class="w-full px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                >
                  📞 Call to RSVP
                </button>
                <a 
                  href="calendar.html?location=${location}" 
                  class="block w-full px-4 py-2 border-2 border-emerald-600 text-emerald-600 font-medium rounded-lg hover:bg-emerald-50 transition-colors text-sm text-center"
                >
                  📅 View Full Calendar
                </a>
              </div>
            </div>
            
            <div class="mt-4 pt-4 border-t border-gray-100">
              <button 
                onclick="toggleEventDetails(${index})"
                class="text-emerald-600 hover:text-emerald-700 font-medium text-sm inline-flex items-center w-full justify-center"
              >
                <span class="toggle-text">View Details</span>
                <svg class="ml-1 w-4 h-4 transition-transform duration-300 toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `
      )
      .join("");

    root.innerHTML = `
        <section id="events" class="py-20 bg-gray-50">
          <div class="container mx-auto px-4">
            <div class="text-center mb-12">
              <h2 class="text-4xl font-bold text-gray-900 mb-4">
                Next Upcoming Events 📅
              </h2>
              <p class="text-lg text-gray-600 mb-8">
                Don't miss out on these exciting upcoming events at The Dog Bar!
              </p>
              <a 
                href="calendar.html?location=${location}" 
                class="inline-block px-6 py-3 bg-emerald-600 text-white font-semibold rounded-full hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-xl"
              >
                View Full Calendar
              </a>
            </div>
            <div class="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
              ${eventsHTML}
            </div>
            <div class="text-center mt-12">
              <p class="text-gray-600 mb-4">Don't see what you're looking for?</p>
              <a 
                href="site.html?location=${location}#contact" 
                class="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Contact us about hosting your own event
              </a>
            </div>
          </div>
        </section>
      `;
  },
};

// Register component
window.DogBarComponents.Events = EventsComponent;

// Global function to toggle event details
window.toggleEventDetails = function (eventIndex) {
  const eventCard = document.querySelector(
    `[data-event-index="${eventIndex}"]`
  );
  if (!eventCard) return;

  const detailsSection = eventCard.querySelector(".event-details");
  const toggleText = eventCard.querySelector(".toggle-text");
  const toggleIcon = eventCard.querySelector(".toggle-icon");
  const expandIcon = eventCard.querySelector(".expand-icon");

  if (detailsSection.classList.contains("hidden")) {
    // Expand
    detailsSection.classList.remove("hidden");
    toggleText.textContent = "Hide Details";
    toggleIcon.style.transform = "rotate(180deg)";
    expandIcon.style.transform = "rotate(180deg)";
    eventCard.style.transform = "translateY(-8px)";
    eventCard.style.boxShadow = "0 20px 40px rgba(0,0,0,0.15)";
  } else {
    // Collapse
    detailsSection.classList.add("hidden");
    toggleText.textContent = "View Details";
    toggleIcon.style.transform = "rotate(0deg)";
    expandIcon.style.transform = "rotate(0deg)";
    eventCard.style.transform = "translateY(0)";
    eventCard.style.boxShadow = "0 10px 25px rgba(0,0,0,0.1)";
  }
};
