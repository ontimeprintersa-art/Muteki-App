const WHATSAPP_NUMBER = "243812345678"; // Replace with your actual WhatsApp number (format: 243XXXXXXXXX)

const products = [
  {
    name: "Sac en Ankara",
    seller: "REBECCA NSOMBO",
    age: 22,
    city: "Kinshasa",
    price: 25,
    category: "Mode",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=80"
  },

  {
    name: "Gâteau d'anniversaire",
    seller: "JONATHAN NTUMBA",
    age: 19,
    city: "Lubumbashi",
    price: 15,
    category: "Nourriture",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700&q=80"
  },

  {
    name: "Création Logo + Affiche",
    seller: "FANNY KABONGO",
    age: 24,
    city: "Goma",
    price: 30,
    category: "Tech",
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=700&q=80"
  },

  {
    name: "Tableau artistique",
    seller: "JOSIAS MWAMBA",
    age: 25,
    city: "LIKASI",
    price: 14,
    category: "Art",
    image: "https://images.unsplash.com/photo-1577083552431-6e5fd01988a5?auto=format&fit=crop&w=700&q=80"
  }
];

const productsContainer = document.getElementById("products");
const searchInput = document.getElementById("searchInput");
const productCount = document.getElementById("productCount");

function displayProducts(list) {
  productsContainer.innerHTML = "";

  productCount.textContent = `${list.length} produit${list.length > 1 ? "s" : ""}`;

  if (list.length === 0) {
    productsContainer.innerHTML = `
      <div class="empty">
        <div style="font-size:40px;">🔎</div>
        <h3>Aucun produit trouvé</h3>
        <p>Essaie une autre recherche.</p>
      </div>
    `;
    return;
  }

  list.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";

    card.innerHTML = `
      <div class="product-image">
        <img
          src="${product.image}"
          alt="${product.name}"
          loading="lazy"
        >
        <button
          class="favorite"
          onclick="favoriteProduct(this)"
        >
          ♡
        </button>
      </div>

      <div class="product-info">
        <h3>${product.name}</h3>

        <p class="seller">
          👤 ${product.seller}, ${product.age} ans<br>
          📍 ${product.city}
        </p>

        <span class="price">
          ${product.price} CDF
        </span>

        <button
          class="order-btn"
          onclick='commanderWhatsApp(
            ${JSON.stringify(product.name)},
            ${JSON.stringify(product.seller)},
            ${product.price}
          )'
        >
          💬 Commander
        </button>

        <button
          class="pay-btn"
          onclick="mobileMoney()"
        >
          💳 Mobile Money
        </button>
      </div>
    `;

    productsContainer.appendChild(card);
  });
}

function commanderWhatsApp(produit, vendeur, prix) {
  if (WHATSAPP_NUMBER === "243812345678") {
    alert("⚠️ Ajoute d'abord ton numéro WhatsApp dans app.js (ligne 1).\n\nFormat: 243XXXXXXXXX");
    return;
  }

  const message = `Bonjour 👋

Je veux commander :

🛍️ Produit : ${produit}
💰 Prix : ${prix} CDF
👤 Vendeur : ${vendeur}

Je viens de Muteki 🇨🇩`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

function mobileMoney() {
  alert(
    "💳 Paiement Mobile Money\n\n" +
    "Cette fonctionnalité sera bientôt disponible.\n\n" +
    "Pour le moment : paiement à la livraison."
  );
}

function favoriteProduct(button) {
  if (button.textContent === "♡") {
    button.textContent = "♥️";
    button.style.color = "#ce1126";
  } else {
    button.textContent = "♡";
    button.style.color = "inherit";
  }
}

/* RECHERCHE */
searchInput.addEventListener("input", function() {
  const value = this.value.toLowerCase().trim();

  const filtered = products.filter(product =>
    product.name.toLowerCase().includes(value) ||
    product.city.toLowerCase().includes(value) ||
    product.category.toLowerCase().includes(value) ||
    product.seller.toLowerCase().includes(value)
  );

  displayProducts(filtered);
});

/* CATEGORIES */
document.querySelectorAll(".category").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".category").forEach(btn =>
      btn.classList.remove("active")
    );

    button.classList.add("active");

    const category = button.dataset.category;

    if (category === "all") {
      displayProducts(products);
    } else {
      displayProducts(
        products.filter(product => product.category === category)
      );
    }
  });
});

/* START */
displayProducts(products);
