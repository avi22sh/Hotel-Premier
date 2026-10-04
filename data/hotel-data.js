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
      image: 'assets/menu-images/THALIS/PREMIER MAHARAJA THALI.jfif',
      title: 'Premier Maharaja Royal Thali',
      subtitle: 'Lavish Multi-Course Pure Veg Feast • Authentic Indian Hospitality'
    },
    {
      id: 'slide-paneer',
      image: 'assets/menu-images/PANEER SPECIALITIES/PANEER BUTTER MASALA.avif',
      title: 'Royal Paneer & North Indian Gravies',
      subtitle: 'Prepared Fresh in Pride Kitchen with Pure Desi Spices & Butter'
    },
    {
      id: 'slide-tandoor',
      image: 'assets/menu-images/TANDOOR CLASSICS/TANDOOR PLATTER.avif',
      title: 'Sizzling Tandoor Classics & Kababs',
      subtitle: 'Smoky Paneer Tikka, Reshmi Kabab & Hara Bhara from Clay Oven'
    },
    {
      id: 'slide-biryani',
      image: 'assets/menu-images/RICE & BIRYANI FIESTA/VEG DUM BIRYANI.avif',
      title: 'Aromatic Veg Dum Biryani & Pulao',
      subtitle: 'Slow-Cooked Fragrant Basmati Rice with Rich Spices & Veg Raita'
    },
    {
      id: 'slide-breakfast',
      image: 'assets/menu-images/MORNING DELIGHT/poori bhaji.avif',
      title: 'Morning Delights Breakfast',
      subtitle: 'Golden Crispy Poori Bhaji, Chole Bhature, Hot Parathas & Special Tea'
    },
    {
      id: 'slide-chinese',
      image: 'assets/menu-images/INDO CHINESE NIBBLES/CHINESE PLATTER.avif',
      title: 'Indo-Chinese Wok & Starters',
      subtitle: 'Crispy Manchurian, Paneer Chilly, Spring Rolls & Sizzling Noodles'
    }
  ],

  roomCategories: [
    {
      id: 'ac-super-deluxe',
      name: 'AC Super Deluxe Room',
      hindiName: 'एसी सुपर डीलक्स रूम',
      marathiName: 'एसी सुपर डीलक्स रूम',
      bedType: 'King Size Luxury Bed',
      inventoryCount: '2 Rooms Only',
      bedDetail: '👑 King Bed (Total 2 Exclusive Rooms in Hotel)',
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=700&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=700&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=700&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=700&auto=format&fit=crop&q=80'
      ],
      description: 'Exclusive luxury air-conditioned room with an expansive King Size bed, split AC, smart LED TV, hot water, and Pride Pure Veg room service (7:30 AM – 10:30 PM). Total 2 rooms in property. Can comfortably accommodate 2 to 3 Extra Beds (₹300/bed).',
      extraBedRate: 300,
      maxExtraBeds: 3,
      extraBedDetail: 'Accommodates 2 to 3 Extra Beds (₹300/bed)',
      features: [
        '👑 King Size Luxury Bed',
        '🏢 Total 2 Rooms in Hotel',
        '🛏️ Can Accommodate 2–3 Extra Beds (₹300/bed)',
        '❄️ Silent Split Air Conditioning',
        '📺 Large Screen Smart LED TV',
        '📶 High-Speed Free Wi-Fi',
        '🚿 24x7 Hot & Cold Water',
        '🍽️ Room Service (7:30 AM – 10:30 PM)'
      ],
      tariff: {
        single: { roomOnly: 2000, withBreakfast: 2200 },
        double: { roomOnly: 2200, withBreakfast: 2600 },
        extraBed: 300
      },
      tag: 'Exclusive VIP & Couple Suite (2 Rooms • Fits 2-3 Extra Beds)'
    },
    {
      id: 'ac-deluxe-queen',
      name: 'AC Deluxe Room (Queen Bed)',
      hindiName: 'एसी डीलक्स रूम (क्वीन बेड)',
      marathiName: 'एसी डीलक्स रूम (क्वीन बेड)',
      bedType: 'Queen Size Bed',
      inventoryCount: '4 Rooms Available',
      bedDetail: '🛏️ Queen Bed (Total 4 Rooms)',
      image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=700&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=700&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=700&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=700&auto=format&fit=crop&q=80'
      ],
      description: 'Peaceful air-conditioned room featuring a plush Queen Size Bed, workstation, wardrobe, and modern bath amenities. Total 4 rooms available in hotel. Can accommodate 1 Extra Bed (₹300/bed).',
      extraBedRate: 300,
      maxExtraBeds: 1,
      extraBedDetail: 'Accommodates 1 Extra Bed (₹300/bed)',
      features: [
        '🛏️ Queen Size Bed',
        '🏢 Total 4 Rooms in Hotel',
        '🛏️ Can Accommodate 1 Extra Bed (₹300/bed)',
        '❄️ Powerful Air Conditioning',
        '📺 Flat Screen LED TV with DTH',
        '📶 High-Speed Free Wi-Fi',
        '🚿 24x7 Hot & Cold Water',
        '🍽️ Room Service (7:30 AM – 10:30 PM)'
      ],
      tariff: {
        single: { roomOnly: 1800, withBreakfast: 2000 },
        double: { roomOnly: 2000, withBreakfast: 2400 },
        extraBed: 300
      },
      tag: 'Ideal for Couples & Executives (4 Rooms • Fits 1 Extra Bed)'
    },
    {
      id: 'ac-deluxe-twin',
      name: 'AC Deluxe Room (Twin Beds)',
      hindiName: 'एसी डीलक्स रूम (ट्विन बेड्स)',
      marathiName: 'एसी डीलक्स रूम (ट्विन बेड्स)',
      bedType: 'Twin Single Beds (2 Separate Beds)',
      inventoryCount: '8 Rooms Available',
      bedDetail: '🛏️🛏️ Twin Beds (Total 8 Rooms)',
      image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=700&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=700&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=700&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=700&auto=format&fit=crop&q=80'
      ],
      description: 'Popular air-conditioned room with 2 comfortable separate Single Beds. Ideal for wedding attendees, Barat guests, friends, and corporate colleagues. Total 8 rooms available in hotel. Can comfortably accommodate 2 Extra Beds (₹300/bed).',
      extraBedRate: 300,
      maxExtraBeds: 2,
      extraBedDetail: 'Accommodates 2 Extra Beds (₹300/bed)',
      features: [
        '🛏️🛏️ 2 Separate Single Beds',
        '🏢 Total 8 Rooms in Hotel',
        '🛏️ Can Accommodate 2 Extra Beds (₹300/bed)',
        '❄️ Powerful Air Conditioning',
        '📺 Flat Screen LED TV with DTH',
        '📶 High-Speed Free Wi-Fi',
        '🚿 24x7 Hot & Cold Water',
        '🍽️ Room Service (7:30 AM – 10:30 PM)'
      ],
      tariff: {
        single: { roomOnly: 1800, withBreakfast: 2000 },
        double: { roomOnly: 2000, withBreakfast: 2400 },
        extraBed: 300
      },
      tag: 'Most Popular for Wedding Guests & Barat (8 Rooms • Fits 2 Extra Beds)'
    }
  ],

  hotelAmenities: [
    { icon: '🌱', title: 'Pride Pure Veg Restaurant', desc: '100% pure vegetarian authentic North & South Indian, Khandeshi & Chinese dining.' },
    { icon: '⏰', title: '24-Hour Check-Out', desc: 'Enjoy maximum flexibility with full 24-hour stay calculated from your check-in time.' },
    { icon: '🍽️', title: 'Room Service: 7:30 AM – 10:30 PM', desc: 'Prompt fresh kitchen room service from morning breakfast till late dinner. (Front Desk 24x7)' },
    { icon: '🚗', title: 'Safe & Secure Parking', desc: 'Spacious on-premises parking for personal cars, wedding buses & tourist vehicles.' },
    { icon: '📶', title: 'High-Speed Wi-Fi', desc: 'Seamless wireless internet access across all rooms and common areas.' },
    { icon: '🛗', title: 'Elevator / Lift Access', desc: 'Senior-citizen and luggage friendly lift access to all room floors.' },
    { icon: '⚡', title: '100% Power Generator Backup', desc: 'Uninterrupted power supply for continuous AC, lighting and hot water.' },
    { icon: '🚆', title: 'Prime Location Connectivity', desc: 'Just 5 mins from Bhusawal Railway Junction on Jamner Road near Nahata College.' }
  ],

  // Advance Bulk Booking Deals for Marriages & Events (Fully Editable via CMS)
  bulkMarriageDeals: [
    {
      tierId: 'tier-5-9',
      name: 'Wedding Group Block (5–9 Rooms)',
      discountPercent: 10,
      minRooms: 5,
      badge: '10% OFF + Priority Allotment',
      perks: [
        'Flat 10% Discount on Published Tariff',
        'Complimentary Morning Chai/Coffee Station',
        'Guaranteed Early Check-in for family elders',
        'Flexible 24-Hour Check-out'
      ]
    },
    {
      tierId: 'tier-10-13',
      name: 'Wedding Silver Block (10–13 Rooms)',
      discountPercent: 15,
      minRooms: 10,
      badge: '15% OFF + Free Morning Chai Station',
      perks: [
        'Flat 15% Discount on Total Tariff',
        'Complimentary Morning Chai/Coffee station for all guests',
        'Priority floor block for whole wedding group',
        'Luggage storage & priority check-in assistance'
      ]
    },
    {
      tierId: 'tier-full-14',
      name: '👑 Full Hotel Buyout (All 14 Rooms Block)',
      discountPercent: 20,
      minRooms: 14,
      badge: '👑 20% OFF + 1 FREE Super Deluxe Suite',
      perks: [
        'Complete 100% Exclusive Hotel Premier Privacy',
        'Flat 20% Mega Group Discount on entire property',
        '1 Complimentary AC Super Deluxe Suite for Bride & Groom',
        'Dedicated Hotel Premier Event Coordinator',
        'Customized Pure Veg Catering Packages & Free Bus Parking'
      ]
    }
  ],

  // Location Highlights & Nearby Connectivity
  locationDistances: [
    { icon: '🚆', place: 'Bhusawal Junction Railway Station', distance: '2.0 KM', time: '5 Mins Drive', desc: 'Major Central Railway junction connecting North, South, East & West India.' },
    { icon: '🎓', place: 'Nahata College (P.O. Nahata College)', distance: '200 Meters', time: '1 Min Walk', desc: 'Prime educational & residential hub on Jamner Road.' },
    { icon: '🛣️', place: 'National Highway NH-53 (Asian Highway 46)', distance: '1.5 KM', time: '3 Mins Drive', desc: 'Direct highway connectivity towards Surat, Nagpur, Dhule & Jalgaon.' },
    { icon: '🏛️', place: 'Ajanta Caves (UNESCO World Heritage)', distance: '58 KM', time: '1 Hr 15 Mins Drive', desc: 'World-famous Buddhist rock-cut cave monuments (Hotel Premier is the ideal transit stay).' },
    { icon: '🕉️', place: 'Changdeo Temple (Tapi-Purna Sangam)', distance: '18 KM', time: '25 Mins Drive', desc: 'Ancient historical pilgrim temple at the holy river confluence.' },
    { icon: '⚡', place: 'Deepnagar Thermal Power Station', distance: '10 KM', time: '15 Mins Drive', desc: 'Major industrial powerhouse & Varangaon Ordnance Factory area.' }
  ],

  // Restaurant Events & Party Catering Packages (Party, Conference, Event, Engagement & Lunch Buyout)
  restaurantEventPackages: [
    {
      id: 'pkg-engagement',
      category: 'engagement',
      name: '💍 Shubh Vivah & Ring Ceremony Banquet',
      hindiName: 'सगाई एवं शुभ पारिवारिक मांगलिक दावत',
      marathiName: 'साखरपुडा व शुभ विवाह मेजवानी',
      ratePerPax: 580,
      minPax: 25,
      badge: '💍 ENGAGEMENT, ROKA & PRE-WEDDING',
      icon: '💍',
      featured: true,
      tag: 'Grand Feast',
      desc: 'Royal banquet experience for Ring Ceremonies (Sakhar Puda / Sagai), Roka, Haldi, Baby Shower (Dohale Jevan) & Upanayan.',
      amenities: ['Private AC Banquet Dining', 'Sound & Mic System', 'Stage / Ring Ceremony Space', 'Dedicated Stewards'],
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
        'Hospitality Perks: Personalized printed menu cards on tables & dedicated senior stewards'
      ]
    },
    {
      id: 'pkg-corporate',
      category: 'conference',
      name: '💼 Corporate Conference & Seminar Meet',
      hindiName: 'कॉर्पोरेट मीटिंग एवं बिजनेस सेमिनार पैकेज',
      marathiName: 'कॉर्पोरेट कॉन्फरन्स व सेमिनार पॅकेज',
      ratePerPax: 380,
      minPax: 15,
      badge: '💼 CORPORATE, CONFERENCES & DOCTOR MEETS',
      icon: '💼',
      tag: 'Professional',
      desc: 'Tailored for Corporate Conferences, Doctor Seminars, Dealer Meets, Board Meetings, Training Workshops & Product Launches.',
      amenities: ['Projector & Screen Assistance', 'Wireless Collar / Hand Mic', 'High-Speed Wi-Fi', 'Notepads & Pens'],
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
        'Conference Amenities: Projector & screen setup, wireless mic, high-speed Wi-Fi & notepad pens'
      ]
    },
    {
      id: 'pkg-birthday',
      category: 'party',
      name: '🎉 Birthday & Family Celebration Feast',
      hindiName: 'बर्थडे, एनिवर्सरी एवं पारिवारिक उत्सव',
      marathiName: 'वाढदिवस व कौटुंबिक आनंद मेजवानी',
      ratePerPax: 320,
      minPax: 15,
      badge: '🎉 BIRTHDAYS, ANNIVERSARIES & PARTIES',
      icon: '🎂',
      tag: 'Celebration',
      desc: 'Joyful celebration spread for Kids & Adults Birthdays, Anniversary milestones, Kitty Parties and Family Reunions.',
      amenities: ['Cake Cutting Table Setup', 'Balloon Space', 'Party Music Connection', 'Private AC Seating'],
      menuChoices: [
        'Welcome Cooler: Blue Curacao Mocktail or Fresh Lime Soda',
        '2 Crunchy Starters: Paneer Crispy + Veg Manchurian Dry / Veg Roll',
        '2 Main Courses: Shahi Paneer Masala + Mix Veg Kolhapuri / Chana Masala',
        'Dal: Special Dal Tadka with Jeera & Desi Ghee',
        'Assorted Breads: Butter Tandoori Roti & Butter Naan',
        'Rice & Raita: Fragrant Veg Pulao or Jeera Rice with Boondi Raita',
        'Salad & Papad: Green Salad, Achar & Roasted Papad',
        'Dessert: Hot Gulab Jamun with Creamy Vanilla Ice Cream Cup',
        'Party Perks: Dedicated cake cutting table, balloon area & music playlist connection'
      ]
    },
    {
      id: 'pkg-hightea',
      category: 'party',
      name: '☕ Kitty Party & High-Tea Gathering',
      hindiName: 'किटी पार्टी एवं हाई-टी नाश्ता मीट',
      marathiName: 'किटी पार्टी व हाय-टी नाश्ता मेजवानी',
      ratePerPax: 220,
      minPax: 15,
      badge: '☕ HIGH-TEA & CASUAL GATHERINGS',
      icon: '☕',
      tag: 'High Tea',
      desc: 'Light & delightful package for Afternoon Kitty Parties, Post-Seminar High-Tea, Bhajan Gatherings & Social Meets.',
      amenities: ['Up to 3 Hours AC Dining', 'Relaxed Ambience', 'Soft Background Music'],
      menuChoices: [
        'Beverage Station: Special Adrak Masala Chai & South Indian Filter Coffee (served twice)',
        '3 Hot Savory Snacks: Paneer Pakoda + Hara Bhara Kabab + Crispy Veg Spring Roll',
        'Dips & Chutneys: Mint-Coriander Chutney, Tangy Imli Chutney & Tomato Sauce',
        'Dessert Sweet: Mini Hot Gulab Jamun or Besan Ladoo',
        'Casual Dining: Comfortable 3-hour private AC hall access with pleasant background music'
      ]
    },
    {
      id: 'pkg-lunch-buyout',
      category: 'buyout',
      name: '👑 Full Restaurant Lunch Hall Buyout (Up to 40 Pax)',
      hindiName: 'सम्पूर्ण रेस्टोरेंट लंच हॉल प्राइवेट बुकिंग (40 व्यक्तियों तक)',
      marathiName: 'संपूर्ण रेस्टॉरंट लंच हॉल प्रायव्हेट बुकिंग (४० व्यक्तींपर्यंत)',
      ratePerPax: 490,
      minPax: 25,
      maxPax: 40,
      badge: '🌟 100% PRIVATE HALL BUYOUT (11:30 AM - 3:30 PM)',
      icon: '🏛️',
      tag: 'Exclusive Buyout',
      isBuyout: true,
      desc: 'Exclusive private buyout of the entire Pride Pure Veg AC Restaurant (up to 40 Pax capacity) during prime Lunch Hours (11:30 AM to 3:30 PM). The restaurant is 100% closed to the general public for complete privacy.',
      amenities: ['Hall 100% Closed to Public', 'Unlimited Grand Buffet', 'Sound & Mic System', 'Zero Hall Rent', 'Reserved Parking'],
      menuChoices: [
        'Complete Hall Privacy: Entire dining hall closed to external guests for your 4-hour slot',
        'Intimate & comfortable seating capacity for up to 40 guests',
        'Unlimited Lavish Pure Veg Buffet (3 Starters, 3 Mains, 2 Dals, Biryani, 2 Sweets)',
        'Welcome Drinks Station for all guests upon arrival',
        'Dedicated Head Chef & Private Service Stewards for your guests only',
        'Sound System & Wireless Mic facility for cake cutting, speeches & music',
        'Personalized Welcome Signage at restaurant entrance',
        'Priority reserved parking for host & guest vehicles',
        'Zero Hall Rental charges when booking the banquet spread for 25 to 40 guests'
      ]
    }
  ]
};


