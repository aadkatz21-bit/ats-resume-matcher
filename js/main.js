// main.js - Site-wide utilities and UI interactions
// Update the footer year automatically
document.addEventListener("DOMContentLoaded", () => {
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Manage cookie consent banner
  initCookieBanner();

  // Update login/logout link depending on auth state
  updateAuthLinks();
});

/**
 * Initialize a simple cookie consent banner.
 * Displays a banner at the bottom of the page asking the user to accept cookies.
 * This script sets a cookie 'cookieConsent' once accepted.
 */
function initCookieBanner() {
  // Only show banner if not previously accepted
  if (document.cookie.includes("cookieConsent=true")) return;
  // Create banner elements
  const banner = document.createElement("div");
  banner.className = "cookie-banner";
  banner.innerHTML = `
    <p>
      This website uses cookies to enhance your experience and to collect anonymized usage
      statistics. By clicking "Accept," you agree to our use of cookies. Learn more in our
      <a href="privacy.html">Privacy Policy</a>.
    </p>
    <button id="acceptCookies" class="btn">Accept</button>
  `;
  document.body.appendChild(banner);
  const acceptBtn = document.getElementById("acceptCookies");
  acceptBtn.addEventListener("click", () => {
    // Set cookie with long expiration (1 year)
    document.cookie = "cookieConsent=true; path=/; max-age=" + 60 * 60 * 24 * 365;
    banner.remove();
    // Optional: initialize analytics once consent is given
    initAnalytics();
  });
}

/**
 * Initialize Google Analytics or other tracking scripts after consent.
 * Replace the GA tracking code below with your own tracking ID.
 */
function initAnalytics() {
  // Replace 'G-XXXXXXXXXX' with your actual Google Analytics Measurement ID
  const measurementId = "G-XXXXXXXXXX";
  if (!measurementId || measurementId.startsWith("G-XXX")) return;
  // Inject GA4 script
  const script1 = document.createElement("script");
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script1.async = true;
  document.head.appendChild(script1);
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);} // eslint-disable-line
  gtag('js', new Date());
  gtag('config', measurementId);
}

/**
 * Update the navigation links to show "Logout" if the user is logged in.
 * This function checks localStorage for a 'user' item.
 */
function updateAuthLinks() {
  const loginLink = document.getElementById("loginLink");
  if (!loginLink) return;
  const userData = localStorage.getItem("user");
  // Remove any existing click event listeners to avoid stacking
  const newLink = loginLink.cloneNode(true);
  loginLink.parentNode.replaceChild(newLink, loginLink);
  if (userData) {
    newLink.textContent = "Logout";
    newLink.href = "#";
    newLink.addEventListener("click", (e) => {
      e.preventDefault();
      // Sign out user
      localStorage.removeItem("user");
      // If Firebase is available, sign out as well
      if (typeof firebase !== "undefined" && firebase.auth) {
        firebase.auth().signOut().catch((err) => console.error(err));
      }
      // Redirect to home page
      window.location.href = "index.html";
    });
  } else {
    newLink.textContent = "Login";
    newLink.href = "login.html";
  }
}
