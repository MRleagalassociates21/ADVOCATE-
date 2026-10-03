// ============================================================
// MR LEGAL ASSOCIATES – script.js
// ============================================================

// ---- EMAIL CONFIGURATION (Formspree) ----
// 1. Visit https://formspree.io and create a free account with mr.legalassociates21@gmail.com
// 2. Click "+ New Form", give it a name (e.g., "MR Legal Contact Form")
// 3. Copy the Form ID from your Formspree endpoint (e.g. if the URL is https://formspree.io/f/mqkvbxyz, the ID is 'mqkvbxyz')
// 4. Paste your Form ID in FORMSPREE_FORM_ID below:
const FORMSPREE_FORM_ID = 'YOUR_FORMSPREE_ID';

// ---- NAVBAR scroll effect ----
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ---- Mobile nav toggle ----
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const spans = navToggle.querySelectorAll('span');
  if (navLinks.classList.contains('open')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity   = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});

// Close nav on link click
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    const spans = navToggle.querySelectorAll('span');
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  });
});

// ---- Active nav link on scroll ----
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  const scrollPos = window.scrollY + 100;
  sections.forEach(sec => {
    const top = sec.offsetTop;
    const h   = sec.offsetHeight;
    const id  = sec.getAttribute('id');
    const link = document.querySelector(`.nav-link[href="#${id}"]`);
    if (link) {
      if (scrollPos >= top && scrollPos < top + h) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active-link'));
        link.classList.add('active-link');
      }
    }
  });
});

// ---- Scroll Reveal ----
const revealElements = document.querySelectorAll(
  '.service-card, .nonlit-card, .ovm-card, .value-item, .contact-item, .pillar, .about-card, .about-text'
);

revealElements.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

revealElements.forEach(el => observer.observe(el));

// Staggered reveal for grids
const staggeredGroups = [
  '.services-grid',
  '.nonlit-grid',
  '.values-grid',
  '.ovm-grid',
  '.about-pillars'
];

staggeredGroups.forEach(selector => {
  const container = document.querySelector(selector);
  if (!container) return;
  const children = container.querySelectorAll('.reveal');
  const groupObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      children.forEach((child, i) => {
        setTimeout(() => child.classList.add('visible'), i * 100);
      });
      groupObserver.unobserve(entries[0].target);
    }
  }, { threshold: 0.05 });
  groupObserver.observe(container);
});

// ---- Contact Form Submission ----
async function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn = document.getElementById('submit-btn');
  const statusEl = document.getElementById('form-status');
  const originalText = btn.textContent;

  // Reset status alert
  if (statusEl) {
    statusEl.className = 'form-status';
    statusEl.textContent = '';
    statusEl.style.display = 'none';
  }

  // Determine endpoint: Formspree (or FormSubmit fallback if Formspree ID is not yet filled in)
  const isFormspreeConfigured = FORMSPREE_FORM_ID && FORMSPREE_FORM_ID !== 'YOUR_FORMSPREE_ID';
  const endpoint = isFormspreeConfigured
    ? `https://formspree.io/f/${FORMSPREE_FORM_ID}`
    : `https://formsubmit.co/ajax/mr.legalassociates21@gmail.com`;

  btn.textContent = 'Sending Enquiry...';
  btn.disabled = true;
  btn.style.opacity = '0.7';

  try {
    const formData = new FormData(form);

    // FormSubmit specific configurations
    if (!isFormspreeConfigured) {
      if (!formData.has('_captcha')) formData.append('_captcha', 'false');
      if (!formData.has('_template')) formData.append('_template', 'table');
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });

    const data = await response.json().catch(() => ({}));

    // FormSubmit returns HTTP 200 with { success: "false", message: "..." } on errors or unactivated forms
    const isSuccess = response.ok && data.success !== 'false' && data.success !== false && !data.error;

    if (isSuccess) {
      btn.textContent = '✓ Enquiry Sent!';
      btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
      btn.style.color = '#ffffff';
      btn.style.opacity = '1';

      if (statusEl) {
        statusEl.className = 'form-status success';
        statusEl.innerHTML = '<strong>Enquiry Submitted!</strong> Thank you for reaching out. We have received your details. Our team will review your case and contact you promptly.';
        statusEl.style.display = 'block';
      }

      form.reset();

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.color = '';
        btn.disabled = false;
      }, 5000);
    } else {
      let errorMsg = 'Failed to submit enquiry. Please check your network or try again.';
      if (data && data.message) {
        errorMsg = data.message;
      } else if (data && data.errors && Array.isArray(data.errors)) {
        errorMsg = data.errors.map(err => err.message).join('. ');
      }
      throw new Error(errorMsg);
    }
  } catch (err) {
    console.error('Submission failed:', err);
    btn.textContent = originalText;
    btn.disabled = false;
    btn.style.opacity = '1';

    if (statusEl) {
      statusEl.className = 'form-status error';
      if (err.message && err.message.toLowerCase().includes('activation')) {
        statusEl.innerHTML = `<strong>Action Required:</strong> FormSubmit sent an activation link to <strong>mr.legalassociates21@gmail.com</strong>.<br />Please open your Gmail inbox, click <strong>"Activate Form"</strong>, and submit again. After this one-time activation, all enquiries will be delivered directly to your inbox.`;
      } else if (window.location.protocol === 'file:') {
        statusEl.innerHTML = `<strong>Local Testing Notice:</strong> You are opening this HTML file directly (<code>file://</code>). Form services require a web server to submit (e.g. VS Code Live Server, or your hosted website domain).<br />Direct contact: <a href="mailto:mr.legalassociates21@gmail.com" style="color:inherit;text-decoration:underline;">mr.legalassociates21@gmail.com</a> | <a href="tel:+918660745813" style="color:inherit;text-decoration:underline;">+91 86607 45813</a>.`;
      } else {
        statusEl.innerHTML = `<strong>Submission issue:</strong> ${err.message || 'Could not send enquiry.'}<br />You can also reach us directly at <a href="mailto:mr.legalassociates21@gmail.com" style="color:inherit;text-decoration:underline;">mr.legalassociates21@gmail.com</a> or <a href="tel:+918660745813" style="color:inherit;text-decoration:underline;">+91 86607 45813</a>.`;
      }
      statusEl.style.display = 'block';
    }
  }
}

// ---- Smooth hover lift for service cards ----
document.querySelectorAll('.service-card, .nonlit-card').forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.willChange = 'transform';
  });
  card.addEventListener('mouseleave', function() {
    this.style.willChange = '';
  });
});

// ---- Active nav link style injection ----
const style = document.createElement('style');
style.textContent = `
  .nav-link.active-link {
    color: #C9A84C !important;
  }
  .nav-link.active-link::after {
    transform: scaleX(1) !important;
  }
`;
document.head.appendChild(style);

console.log('%cMR Legal Associates', 'color:#C9A84C; font-size:20px; font-weight:bold; font-family:serif');
console.log('%cLegal Solutions | Trust | Your Rights Our Priority', 'color:#1A2B4A; font-size:12px;');
