// 9KOS — Shared layout components injected by each page

const NAV_HTML = `
<nav class="nav">
  <a href="index.html" class="nav-logo">
    <span class="dot"></span>9KOS
  </a>
  <ul class="nav-links">
    <li><a href="index.html">Home</a></li>
    <li><a href="services.html">Services</a></li>
    <li><a href="tickets.html">Support</a></li>
    <li><a href="faq.html">FAQ</a></li>
    <li><a href="contact.html">Contact</a></li>
  </ul>
  <button class="nav-cta" onclick="location.href='tickets.html'">Open Ticket</button>
  <button class="nav-mobile-toggle" aria-label="Menu">
    <span></span><span></span><span></span>
  </button>
</nav>`;

const FOOTER_HTML = `
<footer>
  <div class="footer-grid">
    <div class="footer-brand">
      <span class="logo">9KOS</span>
      <p>Full-spectrum IT services for Orlando small businesses and individuals. One technician. Every technology need covered.</p>
      <p style="margin-top:1rem; font-family: var(--mono); font-size:0.7rem; color: var(--gold-text);">9K Systems LLC · Orlando, FL</p>
    </div>
    <div class="footer-col">
      <h4>Services</h4>
      <ul>
        <li><a href="services.html#repair">Computer Repair</a></li>
        <li><a href="services.html#networking">Networking</a></li>
        <li><a href="services.html#consulting">IT Consulting</a></li>
        <li><a href="services.html#seo">SEO</a></li>
        <li><a href="services.html#marketing">Digital Marketing</a></li>
        <li><a href="services.html#strategy">Business Strategy</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>Support</h4>
      <ul>
        <li><a href="tickets.html">Open a Ticket</a></li>
        <li><a href="tickets.html#track">Track Ticket</a></li>
        <li><a href="faq.html">FAQ</a></li>
        <li><a href="contact.html">Contact Us</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>Legal</h4>
      <ul>
        <li><a href="privacy.html">Privacy Policy</a></li>
        <li><a href="terms.html">Terms of Service</a></li>
        <li><a href="contact.html">Business Inquiries</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <p>© ${new Date().getFullYear()} 9K Systems LLC. All rights reserved.</p>
    <div class="footer-location">Orlando, FL — Available Now</div>
    <p>Built & operated by 9K Systems</p>
  </div>
</footer>`;

document.addEventListener('DOMContentLoaded', () => {
  // Inject nav
  const navMount = document.getElementById('nav-mount');
  if (navMount) navMount.innerHTML = NAV_HTML;
  // Inject footer
  const footerMount = document.getElementById('footer-mount');
  if (footerMount) footerMount.innerHTML = FOOTER_HTML;
});
