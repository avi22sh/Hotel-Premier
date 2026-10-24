// Public, consented reviews only. Never read private CRM or guest contact data.
document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('public-review-grid');
  const status = document.getElementById('public-review-status');
  if (!grid || !status) return;
  try {
    const response = await fetch('data/public-reviews.json?v=21.63', { cache: 'no-cache' });
    if (!response.ok) throw new Error('Review feed unavailable');
    const data = await response.json();
    const reviews = Array.isArray(data.reviews)
      ? data.reviews.filter(r => r.approved === true && Number.isFinite(r.rating) && r.rating >= 3 && r.rating <= 5 && typeof r.text === 'string' && r.text.trim())
      : [];

    grid.innerHTML = '';
    for (const review of reviews) {
      const card = document.createElement('article');
      card.className = 'review-card modern-review-card';

      const initial = (review.author || 'G').trim().charAt(0).toUpperCase();
      const stars = '★'.repeat(Math.round(review.rating)) + '☆'.repeat(5 - Math.round(review.rating));

      card.innerHTML = `
        <div class="review-card-top">
          <div class="review-author-wrap">
            <div class="review-author-avatar" aria-hidden="true">${initial}</div>
            <div class="review-author-meta">
              <strong class="review-author-name">${review.author || 'Hotel Guest'}</strong>
              <div class="review-stay-type">${review.stayType || 'Verified Stay'} · ${review.date || 'Recent Visit'}</div>
            </div>
          </div>
          <div class="review-rating-badge" aria-label="${review.rating} out of 5 stars">
            <span class="review-stars-text" aria-hidden="true">${stars}</span>
            <span class="review-numeric-score">${review.rating}.0</span>
          </div>
        </div>
        <blockquote class="review-quote-body">
          "${review.text}"
        </blockquote>
        <div class="review-card-footer">
          <span class="review-source-tag review-source-${(review.source || 'google').toLowerCase()}">
            <span class="source-verified-icon">✔</span> ${review.source || 'Google Reviews'}
          </span>
          <span class="review-verified-pill">${review.badge || 'Verified Guest'}</span>
        </div>
      `;
      grid.appendChild(card);
    }

    const updated = Date.parse(data.updatedAt || '');
    const fresh = Number.isFinite(updated) && updated <= Date.now() && Date.now() - updated <= 7 * 24 * 60 * 60 * 1000;
    const dateLabel = Number.isFinite(updated) ? new Date(updated).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }) : '';
    status.textContent = reviews.length
      ? `Verified guest experiences. ${dateLabel ? `Last updated ${dateLabel}.` : ''} ${fresh ? '' : 'Refresh pending.'}`
      : 'Explore guest experiences on our verified hotel listings below.';
  } catch (_) {
    status.textContent = 'Reviews are temporarily unavailable. You can still visit our verified hotel review links below.';
  }
});
