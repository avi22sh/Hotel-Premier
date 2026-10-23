/* Accommodation policy only. Restaurant event seating is a separate capacity. */
(() => {
  'use strict';
  const limits = Object.freeze({ rooms: 12, guests: 36, royale: 2, otherRooms: 10 });
  function estimate(input, categories) {
    const integer = value => /^\d+$/.test(String(value)) && Number.isSafeInteger(Number(value));
    const types = { 'group-12': [12,12], 'super-2': [2,2], 'queen-4': [2,4], 'twin-8': [2,8], 'deluxe-mixed': [2,10] };
    const type = input.type === 'full-14' ? 'group-12' : input.type;
    if (!types[type]) throw Error('Please choose a room collection.');
    const [minRooms,maxRooms] = types[type];
    const rooms = Math.min(maxRooms,Math.max(minRooms,integer(input.rooms) ? Number(input.rooms) : minRooms));
    const nights = integer(input.nights) && Number(input.nights) > 0 ? Number(input.nights) : 0;
    const plan = input.plan === 'RO' ? 'RO' : 'CP';
    const category = id => categories.find(r => r.id === id);
    const king = category('ac-super-deluxe'), queen = category('ac-deluxe-queen'), twin = category('ac-deluxe-twin');
    const rate = room => room?.tariff?.double?.[plan === 'CP' ? 'withBreakfast' : 'roomOnly'];
    let baseRate, physicalBeds;
    if (type === 'group-12') {
      if (rate(queen) !== rate(twin)) throw Error('Mixed-room rates need staff confirmation.');
      baseRate = limits.royale * rate(king) + limits.otherRooms * rate(queen);
      // Exact Queen/Twin allocation remains subject to staff confirmation. Use the
      // conservative capacity of 4 Queen + 6 Twin, never promise a room assignment.
      physicalBeds = 2 * king.maxExtraBeds + 4 * queen.maxExtraBeds + 6 * twin.maxExtraBeds;
    } else if (type === 'deluxe-mixed') {
      if (rate(queen) !== rate(twin)) throw Error('Mixed-room rates need staff confirmation.');
      baseRate = rooms * rate(queen);
      physicalBeds = Math.min(rooms,4) * queen.maxExtraBeds + Math.max(0,rooms-4) * twin.maxExtraBeds;
    } else {
      const room = type === 'super-2' ? king : type === 'queen-4' ? queen : twin;
      baseRate = rooms * rate(room); physicalBeds = rooms * room.maxExtraBeds;
    }
    const maxBeds = Math.min(physicalBeds, limits.guests - rooms * 2);
    const paidBeds = Math.min(maxBeds, Math.max(0, integer(input.paidBeds) ? Number(input.paidBeds) : 0));
    const childBeds = Math.min(maxBeds-paidBeds, Math.max(0, integer(input.childBeds) ? Number(input.childBeds) : 0));
    const guests = Math.min(limits.guests,Math.max(rooms,integer(input.guests) ? Number(input.guests) : rooms * 2));
    const capacity = rooms * 2 + paidBeds + childBeds;
    const extraBedRate = plan === 'CP' ? 500 : 300;
    const extraBedCost = paidBeds * extraBedRate * nights;
    const baseRoomPrice = baseRate * nights, finalPrice = baseRoomPrice + extraBedCost;
    let error = '';
    if (!nights || !Number.isSafeInteger(finalPrice) || finalPrice <= 0) error = 'Enter a valid whole number of nights.';
    else if (guests > capacity) error = 'Add the required extra beds, reduce the guest count or request more rooms. Children are included in the guest total.';
    return { type, rooms, minRooms, maxRooms, guests, maxGuests: Math.min(limits.guests, rooms*2+physicalBeds), nights, plan, paidBeds, childBeds, maxBeds, extraBedRate, extraBedCost, baseRoomPrice, finalPrice, valid: !error, error };
  }
  function deals(saved, defaults) {
    if (!Array.isArray(saved)) return defaults;
    // Existing stored full-property offers conflict with the new group limit.
    // Keep customized valid tiers; obsolete factory tiers use their revised copy.
    const legacy = ['tier-5-9','tier-10-13','tier-full-14'];
    const obsoleteNames = /^(Silver Group Stay Privilege|Gold Group Stay Privilege|👑 Platinum Property Buyout)/;
    if (saved.some(d => d.minRooms > limits.rooms || (legacy.includes(d.tierId) && obsoleteNames.test(d.name)) || /(?:all\s*14|full.property\s*buyout|10\s*[–-]\s*13|100%.*privacy)/i.test([d.name,d.badge,...(Array.isArray(d.perks) ? d.perks : [])].join(' ')))) return defaults;
    return saved.filter(d => Number.isInteger(d.minRooms) && d.minRooms >= 1 && d.minRooms <= limits.rooms);
  }
  window.HotelGroupStays = Object.freeze({ limits, estimate, deals });
})();
