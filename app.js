// Lumen storefront — tiny vanilla JS.
// Renders the hero tagline and formats the product prices.

const TAGLINE = "Hand poured soy candles for slow evenings at home";

// Build the hero tagline from the words above.
function renderTagline(text) {
  return text
    .split(" ")
    .map((word) => word)
    .join(" ");
}

// Format a price given in integer cents, e.g. 3200 -> "$32.00".
function formatPrice(cents) {
  return "$" + (cents / 100).toFixed(2);
}

function init() {
  const tagline = document.getElementById("tagline");
  if (tagline) tagline.textContent = renderTagline(TAGLINE);

  document.querySelectorAll(".price").forEach((el) => {
    const cents = Number(el.getAttribute("data-cents"));
    el.textContent = formatPrice(cents);
  });

  let count = 0;
  const cartLink = document.querySelector(".cta-link");
  document.querySelectorAll(".add").forEach((btn) => {
    btn.addEventListener("click", () => {
      count += 1;
      if (cartLink) cartLink.textContent = "Cart (" + count + ")";
    });
  });
}

document.addEventListener("DOMContentLoaded", init);
