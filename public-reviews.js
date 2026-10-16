// Public, consented reviews only. Never read private CRM or guest contact data.
document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('public-review-grid');
  const status = document.getElementById('public-review-status');
  if (!grid || !status) return;
  try {
    const response = await fetch('data/public-reviews.json?v=21.0', {cache:'no-cache'});
    if (!response.ok) throw new Error('Review feed unavailable');
    const data = await response.json();
    const reviews = Array.isArray(data.reviews) ? data.reviews.filter(r => r.approved === true && typeof r.text === 'string' && r.text.trim()) : [];
    for (const review of reviews) {
      const card = document.createElement('article'); card.className = 'review-card';
      const author = document.createElement('strong'); author.textContent = review.author || 'Hotel guest';
      const quote = document.createElement('blockquote'); quote.textContent = review.text;
      card.append(author, quote);
      if (Number.isFinite(review.rating) && review.rating >= 1 && review.rating <= 5) {
        const rating = document.createElement('p'); rating.textContent = `${review.rating} / 5`; card.append(rating);
      }
      grid.append(card);
    }
    status.textContent = reviews.length ? 'Guest experiences shared with permission.' : 'Read guest experiences on our hotel listings below, or share your own experience here.';
  } catch {
    status.textContent = 'Reviews are temporarily unavailable. You can still visit our hotel review links below.';
  }
});
