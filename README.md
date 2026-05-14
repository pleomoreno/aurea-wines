# Aurea Wines
Storefront website developed for Aurea Wines — a curated selection of wines, olive oils and vinegars. Built with vanilla HTML, CSS and JavaScript, integrated with the Shopify Storefront API for real-time product and inventory data. Orders are handled via WhatsApp.

## 🧩 About
Aurea Wines is a static storefront with a full product catalog, individual product pages, a persistent shopping cart and a WhatsApp-based checkout flow. Products, stock and availability are pulled live from Shopify. When a product sells out, it stays visible in the catalog marked as unavailable — no manual update needed on the site.

## 🛠️ Tech Stack
| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, JavaScript (ES6+) |
| Product data | Shopify Storefront API (GraphQL) |
| Hosting | Netlify |
| Domain | Registro.br |
| Orders | WhatsApp |
| Version Control | Git / GitHub |

## 🚀 Getting Started
```bash
# Clone the repository
git clone https://github.com/pleomoreno/aurea-wines.git
cd aurea-wines
```
No build step required. Open `html/index.html` directly in a browser, or use a local server:
```bash
# With VS Code Live Server extension, right-click index.html → Open with Live Server
# Or with Python
python3 -m http.server 8000
```
Before running, configure your Shopify credentials in `js/shopify.js`:
```js
const SHOPIFY_CONFIG = {
  domain:      'your-store.myshopify.com',
  publicToken: 'YOUR_PUBLIC_TOKEN',
  apiVersion:  '2024-01',
};
```

## 📁 Project Structure
```
Wines-Aurea/
├── html/
│   ├── index.html       # Home page
│   ├── catalogo.html    # Full catalog with filters and pagination
│   ├── produto.html     # Individual product page (?handle=...)
│   ├── sobre.html       # About page
│   └── contato.html     # Contact page
├── css/
│   ├── reset.css
│   ├── variables.css
│   ├── style.css
│   └── animation-scroll.css
├── js/
│   ├── shopify.js       # Shopify Storefront API integration
│   ├── cart.js          # Cart logic + WhatsApp checkout
│   ├── search.js        # Search modal
│   ├── mobile-nav.js    # Mobile hamburger + drawer nav
│   └── animation-scroll.js
├── assets/
│   └── images/
└── README.md
```

## 👤 Author
**Ana Paula Santana** — Founder, Aurea Wines  
**Leonardo Alves Moreno** — Development  
**Santiago Ciapina Martinez Salazar** — Development  
**Juliano Galhardo de Olvieira** — Development