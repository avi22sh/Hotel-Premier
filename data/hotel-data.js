// ==========================================================================
// HOTEL PREMIER - A HOME IN BHUSAWAL
// Hotel Rooms, Exact Tariffs, Timings, Location & Bulk Marriage Deals Database
// ==========================================================================

window.HOTEL_PREMIER_HOTEL_DATA = {
  hotelInfo: {
    name: 'Hotel Premier',
    tagline: 'A Home in Bhusawal',
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
      id: 'slide-dining',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80',
      title: 'Pride Pure Veg AC Restaurant',
      subtitle: 'Pure Veg Royal Culinary Experience in Bhusawal • 100% Refined Oil'
    },
    {
      id: 'slide-breakfast',
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=1000&auto=format&fit=crop&q=80',
      title: 'Morning Delights Breakfast',
      subtitle: 'Crispy Butter Masala Dosas, Soft Idlis, Poori Bhaji & Special Tea'
    },
    {
      id: 'slide-paneer',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1000&auto=format&fit=crop&q=80',
      title: 'Royal Paneer & North Indian Gravies',
      subtitle: 'Prepared Fresh in Pride Kitchen with Authentic Fragrant Spices'
    },
    {
      id: 'slide-pasta',
      image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?w=1000&auto=format&fit=crop&q=80',
      title: 'Desi Masala Pasta & Chinese Wok',
      subtitle: 'Spicy Masala Penne, Sizzling Noodles & Crunchy Starters'
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
      description: 'Exclusive luxury air-conditioned room with an expansive King Size bed, split AC, smart LED TV, hot water, and Pride Pure Veg room service (7:30 AM – 10:30 PM). Total 2 rooms in property.',
      features: [
        '👑 King Size Luxury Bed',
        '🏢 Total 2 Rooms in Hotel',
        '❄️ Silent Split Air Conditioning',
        '📺 Large Screen Smart LED TV',
        '📶 High-Speed Free Wi-Fi',
        '🚿 24x7 Hot & Cold Water',
        '🍽️ Room Service (7:30 AM – 10:30 PM)'
      ],
      tariff: {
        single: { roomOnly: 2000, withBreakfast: 2200 },
        double: { roomOnly: 2200, withBreakfast: 2600 }
      },
      tag: 'Exclusive VIP & Couple Suite (2 Rooms)'
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
      description: 'Peaceful air-conditioned room featuring a plush Queen Size Bed, workstation, wardrobe, and modern bath amenities. Total 4 rooms available in hotel.',
      features: [
        '🛏️ Queen Size Bed',
        '🏢 Total 4 Rooms in Hotel',
        '❄️ Powerful Air Conditioning',
        '📺 Flat Screen LED TV with DTH',
        '📶 High-Speed Free Wi-Fi',
        '🚿 24x7 Hot & Cold Water',
        '🍽️ Room Service (7:30 AM – 10:30 PM)'
      ],
      tariff: {
        single: { roomOnly: 1800, withBreakfast: 2000 },
        double: { roomOnly: 2000, withBreakfast: 2400 }
      },
      tag: 'Ideal for Couples & Executives (4 Rooms)'
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
      description: 'Popular air-conditioned room with 2 comfortable separate Single Beds. Ideal for wedding attendees, Barat guests, friends, and corporate colleagues. Total 8 rooms available in hotel.',
      features: [
        '🛏️🛏️ 2 Separate Single Beds',
        '🏢 Total 8 Rooms in Hotel',
        '❄️ Powerful Air Conditioning',
        '📺 Flat Screen LED TV with DTH',
        '📶 High-Speed Free Wi-Fi',
        '🚿 24x7 Hot & Cold Water',
        '🍽️ Room Service (7:30 AM – 10:30 PM)'
      ],
      tariff: {
        single: { roomOnly: 1800, withBreakfast: 2000 },
        double: { roomOnly: 2000, withBreakfast: 2400 }
      },
      tag: 'Most Popular for Wedding Guests & Barat (8 Rooms)'
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

  // Restaurant Events & Party Catering Packages (15-20+ Pax & Lunch Buyout)
  restaurantEventPackages: [
    {
      id: 'pkg-silver',
      name: 'Silver Executive Gathering',
      hindiName: 'सिल्वर एग्जीक्यूटिव पैकेज',
      marathiName: 'सिल्व्हर एक्झिक्युटिव्ह पॅकेज',
      ratePerPax: 280,
      minPax: 15,
      badge: '15-20+ PAX • QUICK GATHERINGS',
      icon: '🥈',
      desc: 'Ideal for Corporate Lunches, Kitty Parties, Casual Family Dinners & Puja Feasts.',
      menuChoices: [
        'Welcome: Fresh Lime Soda or Special Masala Chai',
        'Starter: Veg Crispy or Hara Bhara Kabab',
        'Main Paneer: Paneer Butter Masala or Kadai Paneer',
        'Dal: Classic Dal Fry or Dal Tadka with Desi Ghee',
        'Breads: Butter Tandoori Roti & Butter Naan',
        'Rice: Fragrant Jeera Rice with Green Salad & Roasted Papad',
        'Dessert: Hot Gulab Jamun (1 pc/pax)'
      ]
    },
    {
      id: 'pkg-gold',
      name: 'Gold Pride Celebration Feast',
      hindiName: 'गोल्ड प्राइड उत्सव दावत',
      marathiName: 'गोल्ड प्राइड सेलिब्रेशन मेजवानी',
      ratePerPax: 420,
      minPax: 15,
      badge: 'POPULAR • 15-20+ PAX CELEBRATIONS',
      icon: '🥇',
      featured: true,
      desc: 'Most loved package for Birthdays, Anniversaries, Thread Ceremonies & Family Get-Togethers.',
      menuChoices: [
        'Welcome: Virgin Mojito or Blue Curacao / Kokum Cooler',
        '2 Starters: Tandoori Paneer Tikka + Veg Spring Roll or Chinese Platter',
        '2 Main Courses: Royal Paneer Lababdar + Mix Veg / Khandeshi Shev Bhaji',
        'Dal: Special Dal Makhani or Dal Tadka',
        'Assorted Breads: Butter Naan, Garlic Naan, Laccha Paratha & Tandoori Roti',
        'Rice: Rich Veg Dum Biryani with Mixed Veg Raita',
        'Salad & Sides: Masala Papad, Tossed Green Salad, Achar',
        '2 Desserts: Hot Gulab Jamun with Vanilla Ice Cream Cup'
      ]
    },
    {
      id: 'pkg-platinum',
      name: 'Platinum Maharaja Royal Banquet',
      hindiName: 'प्लैटिनम महाराजा रॉयल बैंक्वेट',
      marathiName: 'प्लॅटिनम महाराजा रॉयल मेजवानी',
      ratePerPax: 580,
      minPax: 15,
      badge: '👑 ROYAL BANQUET • PRE-WEDDING & VIP',
      icon: '💎',
      desc: 'Grand royal culinary spread for Ring Ceremonies, Pre-Wedding Feasts & VIP Celebrations.',
      menuChoices: [
        '2 Welcome Drinks: Special Fruit Punch & Masala Buttermilk Station',
        'Soup: Hot & Sour or Veg Manchow Soup with Crispy Noodles',
        '3 Starters: Paneer Reshmi Kabab + Veg Cutlet + Crispy Corn Chilli',
        '3 Main Courses: Paneer Tikka Masala + Kaju Curry / Malai Kofta + Khandeshi Patodi',
        'Dals: Dal Makhani + Dal Tadka',
        'Royal Roti Basket: Butter Naan, Cheese Garlic Naan, Laccha Paratha & Missi Roti',
        'Rice: Chef Special Hyderabadi Dum Biryani + Steamed Basmati Rice',
        'Salad & Raita: Boondi Raita, Russian Salad, Roasted Masala Papad',
        'Dessert: Moong Dal / Gajar Halwa + Premium Ice Cream Cup',
        'Perks: Dedicated service stewards & personalized printed menu cards on tables'
      ]
    },
    {
      id: 'pkg-lunch-buyout',
      name: '👑 Full Restaurant Lunch Hall Buyout (Up to 40 Pax)',
      hindiName: 'सम्पूर्ण रेस्टोरेंट लंच हॉल प्राइवेट बुकिंग (40 व्यक्तियों तक)',
      marathiName: 'संपूर्ण रेस्टॉरंट लंच हॉल प्रायव्हेट बुकिंग (४० व्यक्तींपर्यंत)',
      ratePerPax: 490,
      minPax: 25,
      maxPax: 40,
      badge: '🌟 100% PRIVATE HALL • UP TO 40 PAX (11:30 AM - 3:30 PM)',
      icon: '🏛️',
      isBuyout: true,
      desc: 'Exclusive private buyout of the entire Pride Pure Veg AC Restaurant (up to 40 Pax capacity) during prime Lunch Hours (11:30 AM to 3:30 PM). The dining hall is closed to the general public exclusively for your private gathering, ring ceremony, or corporate luncheon.',
      menuChoices: [
        'Complete Exclusive Dining Hall Privacy: General public closed for your 4-hour lunch slot',
        'Intimate & comfortable seating capacity for up to 40 guests',
        'Unlimited Lavish Pure Veg Buffet Spread (3 Starters, 3 Mains, 2 Dals, Biryani, 2 Sweets)',
        'Welcome Drinks Station for all guests on arrival',
        'Dedicated Head Chef & Private Service Stewards',
        'Sound System & Wireless Mic facility for cake cutting, speeches & music',
        'Special Welcome Banner at restaurant entrance',
        'Priority parking reserved for host cars & guest vehicles',
        'Zero Hall Rental charge when booking lunch banquet for 25 to 40 guests'
      ]
    }
  ]
};

