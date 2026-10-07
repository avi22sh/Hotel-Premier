// ==========================================================================
// HOTEL PREMIER - A HOME IN BHUSAWAL
// Hotel Rooms, Exact Tariffs, Timings, Location & Bulk Marriage Deals Database
// ==========================================================================

window.HOTEL_PREMIER_HOTEL_DATA = {
  hotelInfo: {
    name: 'Hotel Premier',
    tagline: 'A Home in Bhusawal',
    restaurantName: 'Pride Pure Veg AC Restaurant',
    fullAddress: 'Near Nahata College, Saket Soc, Jamner Road, Bhusawal - 425 201',
    landmark: 'Near Nahata College & Saket Society (5 Mins / 2 KM from Bhusawal Railway Junction)',
    phones: ['09325375802', '09370848917', '(02582) 240422', '(02582) 240396'],
    whatsapp: '919325375802',
    alternateWhatsapp: '919370848917',
    checkoutPolicy: '24 Hours Check-Out',
    taxPolicy: 'Inclusive of All Taxes',
    roomServiceHours: '7:30 AM to 10:30 PM',
    frontDeskHours: '24 Hours Open',
    breakfastPolicy: 'Complimentary Breakfast (Served 7:30 AM to 10:30 AM from fixed menu in Pride Pure Veg Restaurant)',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Hotel+Premier+Jamner+Road+Near+Nahata+College+Bhusawal+425201',
    inventorySummary: {
      totalRooms: 14,
      superDeluxeRooms: 2,
      deluxeRooms: 12,
      deluxeQueenBeds: 4,
      deluxeTwinBeds: 8
    }
  },

  restaurantHeroSlides: [
    {
      id: 'slide-thali',
      image: 'assets/menu-images/THALIS/MAHARAJA THALI.jpg',
      title: 'Premier Maharaja Royal Thali',
      subtitle: 'Lavish Multi-Course Pure Veg Feast â€¢ Authentic Indian Hospitality'
    },
    {
      id: 'slide-paneer',
      image: 'assets/menu-images/PANEER SPECIALITIES/PANEER BUTTER MASALA.jpg',
      title: 'Royal Paneer & North Indian Gravies',
      subtitle: 'Prepared Fresh in Pride Kitchen with Pure Desi Spices & Butter'
    },
    {
      id: 'slide-tandoor',
      image: 'assets/menu-images/TANDOOR CLASSICS/TANDOORI PLATTER.jpg',
      title: 'Sizzling Tandoor Classics & Kababs',
      subtitle: 'Smoky Paneer Tikka, Reshmi Kabab & Hara Bhara from Clay Oven'
    },
    {
      id: 'slide-biryani',
      image: 'assets/menu-images/RICE & BIRYANI FIESTA/VEG DUM BIRYANI.jpg',
      title: 'Aromatic Veg Dum Biryani & Pulao',
      subtitle: 'Slow-Cooked Fragrant Basmati Rice with Rich Spices & Veg Raita'
    },
    {
      id: 'slide-breakfast',
      image: 'assets/menu-images/MORNING DELIGHT/POORI BHAJI.jpg',
      title: 'Morning Delights Breakfast',
      subtitle: 'Golden Crispy Poori Bhaji, Chole Bhature, Hot Parathas & Special Tea'
    },
    {
      id: 'slide-chinese',
      image: 'assets/menu-images/INDO CHINESE NIBBLES/CHINESE PLATTER.jpg',
      title: 'Indo-Chinese Wok & Starters',
      subtitle: 'Crispy Manchurian, Paneer Chilly, Spring Rolls & Sizzling Noodles'
    }
  ],

  roomCategories: [
    {
      id: 'ac-super-deluxe',
      name: 'AC Super Deluxe Room',
      hindiName: 'à¤à¤¸à¥€ à¤¸à¥à¤ªà¤° à¤¡à¥€à¤²à¤•à¥à¤¸ à¤°à¥‚à¤®',
      marathiName: 'à¤à¤¸à¥€ à¤¸à¥à¤ªà¤° à¤¡à¥€à¤²à¤•à¥à¤¸ à¤°à¥‚à¤®',
      bedType: 'King Size Luxury Bed',
      inventoryCount: '2 Rooms Only',
      bedDetail: 'ðŸ‘‘ King Bed (Total 2 Exclusive Rooms in Hotel)',
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=700&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=700&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=700&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=700&auto=format&fit=crop&q=80'
      ],
      description: 'Exclusive luxury air-conditioned room with an expansive King Size bed, split AC, smart LED TV, hot water, and Pride Pure Veg room service (7:30 AM â€“ 10:30 PM). Total 2 rooms in property. Can comfortably accommodate 2 to 3 Extra Beds (â‚¹300/bed).',
      extraBedRate: 300,
      maxExtraBeds: 3,
      extraBedDetail: 'Accommodates 2 to 3 Extra Beds (â‚¹300/bed)',
      features: [
        'ðŸ‘‘ King Size Luxury Bed',
        'ðŸ¢ Total 2 Exclusive Rooms in Hotel',
        'â„ï¸ Silent Split Air Conditioning (Split AC)',
        'ðŸ’§ Packaged Drinking Water (Complimentary)',
        'â˜• Electric Kettle with Tea & Coffee Setup',
        'ðŸª Fresh Biscuits & Drinking Glasses',
        'ðŸ§¼ Toiletries Kit (Soap, Shampoo, Dental Kit)',
        'ðŸš¿ 24x7 Geyser Hot Water & Fresh Towels',
        'ðŸ“º Large Screen Smart LED TV & Free Wi-Fi',
        'â˜Žï¸ Front Desk Intercom & Room Service (7:30 AM â€“ 10:30 PM)',
        'ðŸ›ï¸ Can Accommodate 2â€“3 Extra Beds (â‚¹300/bed)'
      ],
      tariff: {
        single: { roomOnly: 2000, withBreakfast: 2200 },
        double: { roomOnly: 2200, withBreakfast: 2600 },
        extraBed: 300
      },
      tag: 'Exclusive VIP & Couple Suite (2 Rooms â€¢ Fits 2-3 Extra Beds)'
    },
    {
      id: 'ac-deluxe-queen',
      name: 'AC Deluxe Room (Queen Bed)',
      hindiName: 'à¤à¤¸à¥€ à¤¡à¥€à¤²à¤•à¥à¤¸ à¤°à¥‚à¤® (à¤•à¥à¤µà¥€à¤¨ à¤¬à¥‡à¤¡)',
      marathiName: 'à¤à¤¸à¥€ à¤¡à¥€à¤²à¤•à¥à¤¸ à¤°à¥‚à¤® (à¤•à¥à¤µà¥€à¤¨ à¤¬à¥‡à¤¡)',
      bedType: 'Queen Size Bed',
      inventoryCount: '4 Rooms Available',
      bedDetail: 'ðŸ›ï¸ Queen Bed (Total 4 Rooms)',
      image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=700&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=700&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=700&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=700&auto=format&fit=crop&q=80'
      ],
      description: 'Peaceful air-conditioned room featuring a plush Queen Size Bed, workstation, wardrobe, and modern bath amenities. Total 4 rooms available in hotel. Can accommodate 1 Extra Bed (â‚¹300/bed).',
      extraBedRate: 300,
      maxExtraBeds: 1,
      extraBedDetail: 'Accommodates 1 Extra Bed (â‚¹300/bed)',
      features: [
        'ðŸ›ï¸ Queen Size Bed',
        'ðŸ¢ Total 4 Rooms in Hotel',
        'â„ï¸ Silent Split Air Conditioning (Split AC)',
        'ðŸ’§ Packaged Drinking Water (Complimentary)',
        'â˜• Electric Kettle with Tea & Coffee Setup',
        'ðŸª Fresh Biscuits & Drinking Glasses',
        'ðŸ§¼ Toiletries Kit (Soap, Shampoo, Dental Kit)',
        'ðŸš¿ 24x7 Geyser Hot Water & Fresh Towels',
        'ðŸ“º Flat Screen Smart LED TV & Free Wi-Fi',
        'â˜Žï¸ Front Desk Intercom & Room Service (7:30 AM â€“ 10:30 PM)',
        'ðŸ›ï¸ Can Accommodate 1 Extra Bed (â‚¹300/bed)'
      ],
      tariff: {
        single: { roomOnly: 1800, withBreakfast: 2000 },
        double: { roomOnly: 2000, withBreakfast: 2400 },
        extraBed: 300
      },
      tag: 'Ideal for Couples & Executives (4 Rooms â€¢ Fits 1 Extra Bed)'
    },
    {
      id: 'ac-deluxe-twin',
      name: 'AC Deluxe Room (Twin Beds)',
      hindiName: 'à¤à¤¸à¥€ à¤¡à¥€à¤²à¤•à¥à¤¸ à¤°à¥‚à¤® (à¤Ÿà¥à¤µà¤¿à¤¨ à¤¬à¥‡à¤¡à¥à¤¸)',
      marathiName: 'à¤à¤¸à¥€ à¤¡à¥€à¤²à¤•à¥à¤¸ à¤°à¥‚à¤® (à¤Ÿà¥à¤µà¤¿à¤¨ à¤¬à¥‡à¤¡à¥à¤¸)',
      bedType: 'Twin Single Beds (2 Separate Beds)',
      inventoryCount: '8 Rooms Available',
      bedDetail: 'ðŸ›ï¸ðŸ›ï¸ Twin Beds (Total 8 Rooms)',
      image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=700&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=700&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=700&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=700&auto=format&fit=crop&q=80'
      ],
      description: 'Popular air-conditioned room with 2 comfortable separate Single Beds. Ideal for wedding attendees, Barat guests, friends, and corporate colleagues. Total 8 rooms available in hotel. Can comfortably accommodate 2 Extra Beds (â‚¹300/bed).',
      extraBedRate: 300,
      maxExtraBeds: 2,
      extraBedDetail: 'Accommodates 2 Extra Beds (â‚¹300/bed)',
      features: [
        'ðŸ›ï¸ðŸ›ï¸ 2 Separate Single Beds',
        'ðŸ¢ Total 8 Rooms in Hotel',
        'â„ï¸ Silent Split Air Conditioning (Split AC)',
        'ðŸ’§ Packaged Drinking Water (Complimentary)',
        'â˜• Electric Kettle with Tea & Coffee Setup',
        'ðŸª Fresh Biscuits & Drinking Glasses',
        'ðŸ§¼ Toiletries Kit (Soap, Shampoo, Dental Kit)',
        'ðŸš¿ 24x7 Geyser Hot Water & Fresh Towels',
        'ðŸ“º Flat Screen Smart LED TV & Free Wi-Fi',
        'â˜Žï¸ Front Desk Intercom & Room Service (7:30 AM â€“ 10:30 PM)',
        'ðŸ›ï¸ Can Accommodate 2 Extra Beds (â‚¹300/bed)'
      ],
      tariff: {
        single: { roomOnly: 1800, withBreakfast: 2000 },
        double: { roomOnly: 2000, withBreakfast: 2400 },
        extraBed: 300
      },
      tag: 'Most Popular for Wedding Guests & Barat (8 Rooms â€¢ Fits 2 Extra Beds)'
    }
  ],

  hotelAmenities: [
    { icon: 'ðŸŒ±', title: 'Pride Pure Veg Restaurant', desc: '100% pure vegetarian authentic North & South Indian, Khandeshi & Chinese dining.' },
    { icon: 'â°', title: '24-Hour Check-Out', desc: 'Enjoy maximum flexibility with full 24-hour stay calculated from your check-in time.' },
    { icon: 'ðŸ½ï¸', title: 'Room Service: 7:30 AM â€“ 10:30 PM', desc: 'Prompt fresh kitchen room service from morning breakfast till late dinner. (Front Desk 24x7)' },
    { icon: 'ðŸš—', title: 'Safe & Secure Parking', desc: 'Spacious on-premises parking for personal cars, wedding buses & tourist vehicles.' },
    { icon: 'ðŸ“¶', title: 'High-Speed Wi-Fi', desc: 'Seamless wireless internet access across all rooms and common areas.' },
    { icon: 'ðŸ›—', title: 'Elevator / Lift Access', desc: 'Senior-citizen and luggage friendly lift access to all room floors.' },
    { icon: 'âš¡', title: '100% Power Generator Backup', desc: 'Uninterrupted power supply for continuous AC, lighting and hot water.' },
    { icon: 'ðŸš†', title: 'Prime Location Connectivity', desc: 'Just 5 mins from Bhusawal Railway Junction on Jamner Road near Nahata College.' }
  ],

  // Wedding Barat & Family Group Stay Privileges (Fully Editable via CMS)
  bulkMarriageDeals: [
    {
      tierId: 'tier-5-9',
      name: 'Silver Group Stay Privilege (5â€“9 Rooms)',
      discountPercent: 0,
      minRooms: 5,
      badge: 'Silver Privilege â€¢ Early Check-In',
      perks: [
        'Priority Early Check-in for family elders',
        'Complimentary Morning Chai & Coffee Station',
        'Dedicated Floor Block for family unity',
        'Flexible 24-Hour Check-Out Guarantee'
      ]
    },
    {
      tierId: 'tier-10-13',
      name: 'Gold Group Stay Privilege (10â€“13 Rooms)',
      discountPercent: 0,
      minRooms: 10,
      badge: 'Gold Privilege â€¢ Free Chai Station & Floor Wing',
      perks: [
        'Dedicated Floor Wing reserved for entire group',
        'Complimentary Morning Chai & Filter Coffee station',
        'Priority Luggage Handling & Transit Coordination',
        'Flexible 24-Hour Check-Out Guarantee'
      ]
    },
    {
      tierId: 'tier-full-14',
      name: 'ðŸ‘‘ Platinum Property Buyout (All 14 Rooms)',
      discountPercent: 0,
      minRooms: 14,
      badge: 'ðŸ‘‘ Platinum Buyout â€¢ 100% Hotel Privacy',
      perks: [
        'Complete 100% Exclusive Hotel Premier Privacy',
        '1 Complimentary AC Super Deluxe Room for Bride & Groom / Host',
        'Dedicated Hotel Premier Hospitality Coordinator',
        'Custom Pure Veg Restaurant Dining Coordination & Bus Parking'
      ]
    }
  ],

  // Location Highlights & Nearby Connectivity
  locationDistances: [
    { icon: 'ðŸš†', place: 'Bhusawal Junction Railway Station', distance: '2.0 KM', time: '5 Mins Drive', desc: 'Major Central Railway junction connecting North, South, East & West India.' },
    { icon: 'ðŸŽ“', place: 'Nahata College (P.O. Nahata College)', distance: '200 Meters', time: '1 Min Walk', desc: 'Prime educational & residential hub on Jamner Road.' },
    { icon: 'ðŸ›£ï¸', place: 'National Highway NH-53 (Asian Highway 46)', distance: '1.5 KM', time: '3 Mins Drive', desc: 'Direct highway connectivity towards Surat, Nagpur, Dhule & Jalgaon.' },
    { icon: 'ðŸ›ï¸', place: 'Ajanta Caves (UNESCO World Heritage)', distance: '58 KM', time: '1 Hr 15 Mins Drive', desc: 'World-famous Buddhist rock-cut cave monuments (Hotel Premier is the ideal transit stay).' },
    { icon: 'ðŸ•‰ï¸', place: 'Changdeo Temple (Tapi-Purna Sangam)', distance: '18 KM', time: '25 Mins Drive', desc: 'Ancient historical pilgrim temple at the holy river confluence.' },
    { icon: 'âš¡', place: 'Deepnagar Thermal Power Station', distance: '10 KM', time: '15 Mins Drive', desc: 'Major industrial powerhouse & Varangaon Ordnance Factory area.' }
  ],

  // Restaurant Events & Party Catering Packages (Pride Pure Veg AC Restaurant - Seating Capacity Max 40 Pax)
  restaurantEventPackages: [
    {
      id: 'pkg-engagement',
      category: 'engagement',
      name: 'Engagement, Ring Ceremony & Roka Feast',
      hindiName: 'à¤¸à¤—à¤¾à¤ˆ, à¤°à¤¿à¤‚à¤— à¤¸à¥‡à¤°à¥‡à¤®à¤¨à¥€ à¤à¤µà¤‚ à¤°à¥‹à¤•à¤¾ à¤¸à¥‡à¤²à¤¿à¤¬à¥à¤°à¥‡à¤¶à¤¨ à¤¦à¤¾à¤µà¤¤',
      marathiName: 'à¤¸à¤¾à¤–à¤°à¤ªà¥à¤¡à¤¾, à¤°à¤¿à¤‚à¤— à¤¸à¥‡à¤°à¥‡à¤®à¤¨à¥€ à¤µ à¤°à¥‹à¤•à¤¾ à¤†à¤¨à¤‚à¤¦ à¤®à¥‡à¤œà¤µà¤¾à¤¨à¥€',
      ratePerPax: 580,
      minPax: 20,
      maxPax: 40,
      badge: '',
      icon: 'ðŸ’',
      featured: true,
      tag: 'Grand Feast',
      desc: 'Celebration dining spread inside Pride Pure Veg AC Restaurant for Engagement, Ring Ceremony (Sakhar Puda / Sagai), Roka Ceremony, Baby Shower (Dohale Jevan) & Family Milestones (20 to 40 Pax).',
      amenities: ['Pride AC Restaurant Seating (Max 40 Pax)', 'Dedicated Cake / Ring Table Space', 'Music Playlist Connection', 'Dedicated Stewards'],
      menuChoices: [
        'Welcome: Royal Kesariya Thandai & Virgin Mojito on Arrival',
        'Soup: Hot & Sour or Veg Manchow Soup with Crispy Fried Noodles',
        '3 Royal Starters: Paneer Reshmi Kabab + Veg Crispy + Hara Bhara Kabab',
        '3 Premium Mains: Royal Paneer Lababdar + Kaju Curry / Malai Kofta + Khandeshi Special Shev Bhaji / Patodi Rassa',
        'Dals: Rich Dal Makhani + Yellow Dal Tadka with Desi Ghee',
        'Royal Bread Basket: Butter Naan, Cheese Garlic Naan, Laccha Paratha & Missi Roti',
        'Rice & Raita: Shahi Veg Dum Biryani + Steamed Basmati + Veg Boondi Raita',
        'Salad & Papad: Russian Salad, Tossed Green Salad, Roasted Masala Papad',
        '2 Grand Desserts: Hot Gulab Jamun + Shahi Moong Dal / Gajar Halwa with Vanilla Ice Cream Cup',
        'Hospitality: Personalized table setup & dedicated kitchen service'
      ]
    },
    {
      id: 'pkg-corporate',
      category: 'conference',
      name: 'Corporate Conference & Seminar Meet',
      hindiName: 'à¤•à¥‰à¤°à¥à¤ªà¥‹à¤°à¥‡à¤Ÿ à¤®à¥€à¤Ÿà¤¿à¤‚à¤— à¤à¤µà¤‚ à¤¬à¤¿à¤œà¤¨à¥‡à¤¸ à¤¸à¥‡à¤®à¤¿à¤¨à¤¾à¤° à¤ªà¥ˆà¤•à¥‡à¤œ',
      marathiName: 'à¤•à¥‰à¤°à¥à¤ªà¥‹à¤°à¥‡à¤Ÿ à¤•à¥‰à¤¨à¥à¤«à¤°à¤¨à¥à¤¸ à¤µ à¤¸à¥‡à¤®à¤¿à¤¨à¤¾à¤° à¤ªà¥…à¤•à¥‡à¤œ',
      ratePerPax: 380,
      minPax: 15,
      maxPax: 40,
      badge: '',
      icon: 'ðŸ’¼',
      tag: 'Professional',
      desc: 'Tailored for Corporate Conferences, Doctor Seminars, Dealer Meets, Board Meetings, Training Workshops & Business Lunches in our AC Restaurant (15 to 40 Pax).',
      amenities: ['AC Restaurant Seating (Max 40 Pax)', 'High-Speed Wi-Fi', 'Audio-Visual Projector Setup Available (Chargeable)', 'Notepads & Pens'],
      menuChoices: [
        'Morning Welcome: Freshly Brewed Adrak Masala Chai & Filter Coffee with Assorted Cookies',
        'Mid-Session High Tea: Hot Veg Cutlet / Veg Spring Rolls with Tea & Coffee refill',
        'Executive Pure Veg Lunch Buffet: Fresh Garden Salad & Roasted Papad',
        'Main Paneer: Royal Paneer Butter Masala or Kadai Paneer',
        'Seasonal Veg: Aloo Gobi Matar or Mix Veg Kolhapuri',
        'Dal: Classic Dal Fry / Dal Tadka with Desi Ghee',
        'Breads: Butter Tandoori Roti & Butter Naan',
        'Rice: Fragrant Jeera Rice with Dal Tadka',
        'Dessert: Hot Gulab Jamun (1 pc/pax)',
        'Conference Support: Wi-Fi access, comfortable AC seating, AV projector & sound setup on request (chargeable)'
      ]
    },
    {
      id: 'pkg-birthday',
      category: 'party',
      name: 'Birthday & Anniversary Celebration',
      hindiName: 'à¤¬à¤°à¥à¤¥à¤¡à¥‡, à¤à¤¨à¤¿à¤µà¤°à¥à¤¸à¤°à¥€ à¤à¤µà¤‚ à¤ªà¤¾à¤°à¤¿à¤µà¤¾à¤°à¤¿à¤• à¤‰à¤¤à¥à¤¸à¤µ',
      marathiName: 'à¤µà¤¾à¤¢à¤¦à¤¿à¤µà¤¸, à¥²à¤¨à¤¿à¤µà¥à¤¹à¤°à¥à¤¸à¤°à¥€ à¤µ à¤•à¥Œà¤Ÿà¥à¤‚à¤¬à¤¿à¤• à¤®à¥‡à¤œà¤µà¤¾à¤¨à¥€',
      ratePerPax: 320,
      minPax: 15,
      maxPax: 40,
      badge: '',
      icon: 'ðŸŽ‰',
      tag: 'Celebration',
      desc: 'Joyful celebration spread for Kids & Adults Birthdays, Milestone Anniversaries, Baby Showers and Family Get-Togethers inside our AC Restaurant (15 to 40 Pax).',
      amenities: ['Cake Cutting Table Setup', 'Theme Balloon Decor Available (Chargeable)', 'Party Music Connection', 'Comfortable AC Seating'],
      menuChoices: [
        'Welcome Cooler: Blue Curacao Mocktail or Fresh Lime Soda',
        '2 Crunchy Starters: Paneer Crispy + Veg Manchurian Dry / Veg Roll',
        '2 Main Courses: Shahi Paneer Masala + Mix Veg Kolhapuri / Chana Masala',
        'Dal: Special Dal Tadka with Jeera & Desi Ghee',
        'Assorted Breads: Butter Tandoori Roti & Butter Naan',
        'Rice & Raita: Fragrant Veg Pulao or Jeera Rice with Boondi Raita',
        'Salad & Papad: Green Salad, Achar & Roasted Papad',
        'Dessert: Hot Gulab Jamun with Creamy Vanilla Ice Cream Cup',
        'Party Perks: Dedicated cake cutting table, music playlist connection, optional theme decor (chargeable)'
      ]
    },
    {
      id: 'pkg-hightea',
      category: 'party',
      name: 'Kitty Party & High-Tea Gathering',
      hindiName: 'à¤•à¤¿à¤Ÿà¥€ à¤ªà¤¾à¤°à¥à¤Ÿà¥€ à¤à¤µà¤‚ à¤¹à¤¾à¤ˆ-à¤Ÿà¥€ à¤¨à¤¾à¤¶à¥à¤¤à¤¾ à¤®à¥€à¤Ÿ',
      marathiName: 'à¤•à¤¿à¤Ÿà¥€ à¤ªà¤¾à¤°à¥à¤Ÿà¥€ à¤µ à¤¹à¤¾à¤¯-à¤Ÿà¥€ à¤¨à¤¾à¤¶à¥à¤¤à¤¾ à¤®à¥‡à¤œà¤µà¤¾à¤¨à¥€',
      ratePerPax: 220,
      minPax: 15,
      maxPax: 40,
      badge: '',
      icon: 'â˜•',
      tag: 'High Tea',
      desc: 'Light & delightful spread for Afternoon Kitty Parties, Post-Seminar High-Tea, Bhajan Gatherings & Social Get-Togethers inside our AC Restaurant (15 to 40 Pax).',
      amenities: ['AC Restaurant Seating (Max 40 Pax)', 'Relaxed Ambience', 'Soft Background Music'],
      menuChoices: [
        'Beverage Station: Special Adrak Masala Chai & South Indian Filter Coffee (served twice)',
        '3 Hot Savory Snacks: Paneer Pakoda + Hara Bhara Kabab + Crispy Veg Spring Roll',
        'Dips & Chutneys: Mint-Coriander Chutney, Tangy Imli Chutney & Tomato Sauce',
        'Dessert Sweet: Mini Hot Gulab Jamun or Besan Ladoo',
        'Casual Dining: Comfortable private seating inside Pride Pure Veg AC Restaurant with pleasant background music'
      ]
    },
    {
      id: 'pkg-lunch-buyout',
      category: 'buyout',
      name: 'Full Restaurant Lunch Buyout (Max 40 Pax)',
      hindiName: 'à¤¸à¤®à¥à¤ªà¥‚à¤°à¥à¤£ à¤°à¥‡à¤¸à¥à¤Ÿà¥‹à¤°à¥‡à¤‚à¤Ÿ à¤²à¤‚à¤š à¤ªà¥à¤°à¤¾à¤‡à¤µà¥‡à¤Ÿ à¤¬à¥à¤•à¤¿à¤‚à¤— (à¤…à¤§à¤¿à¤•à¤¤à¤® 40 à¤µà¥à¤¯à¤•à¥à¤¤à¤¿)',
      marathiName: 'à¤¸à¤‚à¤ªà¥‚à¤°à¥à¤£ à¤°à¥‡à¤¸à¥à¤Ÿà¥‰à¤°à¤‚à¤Ÿ à¤²à¤‚à¤š à¤ªà¥à¤°à¤¾à¤¯à¤µà¥à¤¹à¥‡à¤Ÿ à¤¬à¥à¤•à¤¿à¤‚à¤— (à¤œà¤¾à¤¸à¥à¤¤à¥€à¤¤ à¤œà¤¾à¤¸à¥à¤¤ à¥ªà¥¦ à¤µà¥à¤¯à¤•à¥à¤¤à¥€)',
      ratePerPax: 490,
      minPax: 25,
      maxPax: 40,
      badge: '',
      icon: 'ðŸ‘‘',
      tag: '100% Private (12:00 PM - 3:00 PM)',
      isBuyout: true,
      desc: 'Exclusive private lunch buyout of the entire Pride Pure Veg AC Restaurant (max 40 Pax capacity) from 12:00 PM to 3:00 PM. Restaurant 100% closed to the general public for complete privacy. Full lunch buyout only â€¢ Strictly depending upon availability.',
      amenities: ['Restaurant 100% Closed to Public', 'Unlimited Grand Buffet', 'Audio / Mic Facility (Chargeable)', 'No Venue Rent', 'Reserved Parking'],
      menuChoices: [
        'Complete Restaurant Privacy: Entire dining area closed to external guests from 12:00 PM to 3:00 PM',
        'Seating capacity: comfortable dining for up to 40 guests maximum (No banquet hall)',
        'Unlimited Lavish Pure Veg Buffet (3 Starters, 3 Mains, 2 Dals, Biryani, 2 Sweets)',
        'Welcome Drinks Station for all guests upon arrival',
        'Dedicated Head Chef & Private Service Stewards for your guests only',
        'Sound system connection & mics setup on advance request (chargeable)',
        'Personalized Welcome Signage at restaurant entrance',
        'Priority reserved parking for host & guest vehicles',
        'Full Lunch Buyout Only (12:00 PM - 3:00 PM) â€¢ Strictly subject to advance booking & date availability'
      ]
    }
  ],

  // Optional Event Decorations & Audio-Visual Supplies (Chargeable Add-ons)
  eventDecorations: [
    {
      id: 'decor-balloon',
      title: 'Theme Balloon & Cake Table Decor',
      category: 'Birthdays & Baby Showers',
      price: 1500,
      priceDisplay: 'â‚¹ 1,500 onwards',
      isChargeable: true,
      badge: 'ðŸŽˆ POPULAR DECOR',
      image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&auto=format&fit=crop&q=80',
      desc: 'Balloon arch, custom celebration color theme, dedicated cake cutting table decoration & party props. (Chargeable add-on â€¢ Customizable).'
    },
    {
      id: 'decor-floral-ring',
      title: 'Floral Ring & Stage Backdrop Decor',
      category: 'Ring Ceremony & Anniversaries',
      price: 2800,
      priceDisplay: 'â‚¹ 2,800 onwards',
      isChargeable: true,
      badge: 'ðŸ’ ROYAL SETUP',
      image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&auto=format&fit=crop&q=80',
      desc: 'Circular floral ring backdrop, fairy light curtain, personalized couple name board & warm stage illumination. (Chargeable add-on â€¢ Customizable).'
    },
    {
      id: 'decor-baby-shower',
      title: 'Baby Shower (Dohale Jevan) Theme Decor',
      category: 'Baby Shower & Traditional',
      price: 2200,
      priceDisplay: 'â‚¹ 2,200 onwards',
      isChargeable: true,
      badge: 'ðŸ‘¶ TRADITIONAL & PASTEL',
      image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80',
      desc: 'Traditional Dohale Jevan setup, pastel balloon garland, floral welcome stand, and photo corner props. (Chargeable add-on â€¢ Customizable).'
    },
    {
      id: 'av-projector',
      title: 'HD Projector & Wide Screen AV Setup',
      category: 'Corporate & Seminars',
      price: 1500,
      priceDisplay: 'â‚¹ 1,500 flat',
      isChargeable: true,
      badge: 'ðŸ’¼ BUSINESS AV',
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
      desc: 'High-lumen HDMI projector, large projection screen, power extension cables, and presentation setup support. (Chargeable add-on).'
    },
    {
      id: 'av-sound-mic',
      title: 'Party Sound System & 2 Wireless Mics',
      category: 'Music & Speeches',
      price: 999,
      priceDisplay: 'â‚¹ 999 flat',
      isChargeable: true,
      badge: 'ðŸŽ¤ SOUND & MIC',
      image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=80',
      desc: 'Dedicated party audio system with Bluetooth playlist streaming and 2 cordless microphones for speeches and games. (Chargeable add-on).'
    }
  ]
};



