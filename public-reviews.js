// Public, consented reviews only. Never read private CRM or guest contact data.
document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('public-review-grid');
  const status = document.getElementById('public-review-status');
  if (!grid || !status) return;
  const plain = (value, fallback = '') => typeof value === 'string' && value.trim() ? value.trim().slice(0,3000) : fallback;
  const node = (tag, className, value) => {
    const element = document.createElement(tag); element.className = className;
    if (value !== undefined) element.textContent = value;
    return element;
  };
  status.textContent = 'Loading guest experiences…';
  try {
    const response = await fetch('data/public-reviews.json?v=22.32', { cache: 'no-cache', signal:AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error('Review feed unavailable');
    const data = await response.json();
    const reviews = Array.isArray(data.reviews)
      ? data.reviews.filter(r => r && r.approved === true && Number.isFinite(r.rating) && r.rating >= 3 && r.rating <= 5 && plain(r.text))
      : [];

    grid.replaceChildren();
    for (const review of reviews) {
      const card = document.createElement('article');
      card.className = 'review-card modern-review-card';

      const initial = plain(review.author, 'G').charAt(0).toUpperCase();
      const stars = '★'.repeat(Math.round(review.rating)) + '☆'.repeat(5 - Math.round(review.rating));

      const top = node('div', 'review-card-top');
      const authorWrap = node('div', 'review-author-wrap');
      const avatar = node('div', 'review-author-avatar', initial); avatar.setAttribute('aria-hidden', 'true');
      const meta = node('div', 'review-author-meta');
      meta.append(node('strong', 'review-author-name', plain(review.author, 'Hotel Guest')),
        node('div', 'review-stay-type', `${plain(review.stayType, 'Guest experience')} · ${plain(review.date, 'Recent Visit')}`));
      authorWrap.append(avatar, meta);
      const rating = node('div', 'review-rating-badge'); rating.setAttribute('aria-label', `${review.rating} out of 5 stars`);
      const starText = node('span', 'review-stars-text', stars); starText.setAttribute('aria-hidden', 'true');
      rating.append(starText, node('span', 'review-numeric-score', review.rating.toFixed(1)));
      top.append(authorWrap, rating);
      const footer = node('div', 'review-card-footer');
      const source = plain(review.source, 'Source not specified');
      const sourceClasses={Google:'google', 'Google Reviews':'google', MakeMyTrip:'makemytrip', Goibibo:'goibibo'};
      const sourceClass = Object.hasOwn(sourceClasses,source) ? sourceClasses[source] : 'other';
      footer.append(node('span', `review-source-tag review-source-${sourceClass}`, source));
      // A local approval flag does not establish a verified booking or source.
      card.append(top, node('blockquote', 'review-quote-body', plain(review.text)), footer);
      grid.appendChild(card);
    }

    const updated = Date.parse(data.updatedAt || '');
    const fresh = Number.isFinite(updated) && updated <= Date.now() && Date.now() - updated <= 7 * 24 * 60 * 60 * 1000;
    const dateLabel = Number.isFinite(updated) ? new Date(updated).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }) : '';
    status.textContent = reviews.length
      ? `Guest experience highlights. ${dateLabel ? `Last updated ${dateLabel}.` : ''} ${fresh ? '' : 'Refresh pending.'}`
      : 'Read guest experiences on Google, MakeMyTrip and Goibibo using the links below.';
  } catch (_) {
    status.textContent = 'Guest reviews are unavailable here for now. Explore our hotel listings below.';
  }
});
