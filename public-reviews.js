// Public, consented reviews only. Never read private CRM or guest contact data.
document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('public-review-grid');
  const status = document.getElementById('public-review-status');
  if (!grid || !status) return;
  try {
    const response = await fetch('data/public-reviews.json?v=21.0', {cache:'no-cache'});
    if (!response.ok) throw new Error('Review feed unavailable');
    const data = await response.json();
    const reviews = Array.isArray(data.reviews) ? data.reviews.filter(r => r.approved === true && Number.isFinite(r.rating) && r.rating >= 3 && r.rating <= 5 && typeof r.text === 'string' && r.text.trim()) : [];
    for (const review of reviews) {
      const card = document.createElement('article'); card.className = 'review-card';
      const author = document.createElement('strong'); author.textContent = review.author || 'Hotel guest';
      const quote = document.createElement('blockquote'); quote.textContent = review.text;
      card.append(author, quote);
      if (['Google', 'MakeMyTrip', 'Goibibo'].includes(review.source)) {
        const source = document.createElement('small'); source.textContent = review.source; card.append(source);
      }
      if (Number.isFinite(review.rating) && review.rating >= 1 && review.rating <= 5) {
        const rating = document.createElement('p'); rating.textContent = `${review.rating} / 5`; card.append(rating);
      }
      grid.append(card);
    }
    const updated = Date.parse(data.updatedAt || '');
    const fresh = Number.isFinite(updated) && updated <= Date.now() && Date.now() - updated <= 7 * 24 * 60 * 60 * 1000;
    const dateLabel = Number.isFinite(updated) ? new Date(updated).toLocaleDateString('en-IN', {timeZone:'Asia/Kolkata'}) : '';
    status.textContent = reviews.length
      ? `Selected guest reviews rated 3–5 stars; not the complete review history. ${dateLabel ? `Last updated ${dateLabel}.` : 'Update date unavailable.'} ${fresh ? '' : 'Weekly refresh is pending.'}`
      : 'Selected 3–5-star reviews will appear after the authorized feeds are connected. For the complete review history, visit our hotel listings below.';
  } catch {
    status.textContent = 'Reviews are temporarily unavailable. You can still visit our hotel review links below.';
  }
});
