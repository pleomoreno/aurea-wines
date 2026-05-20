const SHOPIFY_CONFIG = {
  domain: "aurea-wines-2.myshopify.com",
  publicToken: "ec0f4dbbc7269df091330838772bad0a",
  apiVersion: "2024-01",
};

(function validateConfig() {
  const ok =
    !SHOPIFY_CONFIG.domain.includes("sua-loja") &&
    !SHOPIFY_CONFIG.publicToken.includes("SEU_TOKEN");
  if (!ok) {
    console.warn(
      "%c[Aurea Wines / Shopify] MODO DEMO — configure domain e publicToken em js/shopify.js",
      "color:#C9A24D;font-weight:bold",
    );
  } else {
    console.info(
      `%c[Aurea Wines / Shopify] ✅ ${SHOPIFY_CONFIG.domain}`,
      "color:#C9A24D;font-weight:bold",
    );
  }
})();

const SHOPIFY_ENDPOINT = `https://${SHOPIFY_CONFIG.domain}/api/${SHOPIFY_CONFIG.apiVersion}/graphql.json`;

function isShopifyConfigured() {
  return (
    !SHOPIFY_CONFIG.domain.includes("sua-loja") &&
    !SHOPIFY_CONFIG.publicToken.includes("SEU_TOKEN")
  );
}

// ── Fetch base ─────────────────────────────────
async function shopifyFetch(query, variables = {}) {
  const res = await fetch(SHOPIFY_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_CONFIG.publicToken,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`HTTP ${res.status}: ${t.slice(0, 200)}`);
  }
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}

// ── Buscar página de produtos ───
async function fetchProductsPage(first = 45, after = null) {
  if (!isShopifyConfigured()) throw new Error("não configurado");

  const query = `
    query getProductsPage($first: Int!, $after: String) {
      products(first: $first, after: $after, sortKey: TITLE) {
        pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
        edges {
          cursor
          node {
            id title handle description productType tags
            priceRange      { minVariantPrice { amount currencyCode } }
            compareAtPriceRange { minVariantPrice { amount currencyCode } }
            images(first: 2) { edges { node { url altText } } }
            variants(first: 1) { edges { node { id availableForSale price { amount currencyCode } } } }
          }
        }
      }
    }`;

  const data = await shopifyFetch(query, { first, after: after || null });
  return {
    products: data.products.edges.map((e) => e.node),
    pageInfo: data.products.pageInfo,
  };
}

async function fetchAllProductsComplete() {
  if (!isShopifyConfigured()) throw new Error("não configurado");

  let all = [];
  let cursor = null;
  let hasNext = true;
  let page = 0;

  while (hasNext) {
    page++;
    console.log(
      `[Shopify] Carregando página ${page}... (${all.length} produtos até agora)`,
    );
    const { products, pageInfo } = await fetchProductsPage(250, cursor);
    all = all.concat(products);
    hasNext = pageInfo.hasNextPage;
    cursor = pageInfo.endCursor;
  }

  console.log(
    `[Shopify] Total carregado: ${all.length} produtos em ${page} request(s) ✅`,
  );
  return all;
}

// ── Buscar produto por handle ──────────────────
async function fetchProductByHandle(handle) {
  if (!isShopifyConfigured()) throw new Error("não configurado");

  const query = `
    query getProduct($handle: String!) {
      product(handle: $handle) {
        id title handle description descriptionHtml productType tags
        priceRange      { minVariantPrice { amount currencyCode } }
        compareAtPriceRange { minVariantPrice { amount currencyCode } }
        images(first: 6) { edges { node { url altText } } }
        variants(first: 10) {
          edges { node { id title availableForSale price { amount currencyCode } } }
        }
      }
    }`;

  const data = await shopifyFetch(query, { handle });
  return data.product;
}

// ── Busca por texto ────────────────────────────
async function searchShopifyProducts(searchQuery, first = 12) {
  if (!isShopifyConfigured()) throw new Error("não configurado");

  const query = `
    query searchProducts($query: String!, $first: Int!) {
      search(query: $query, first: $first, types: PRODUCT) {
        edges {
          node {
            ... on Product {
              id title handle productType tags
              priceRange { minVariantPrice { amount currencyCode } }
              images(first: 1) { edges { node { url altText } } }
              variants(first: 1) { edges { node { id availableForSale } } }
            }
          }
        }
      }
    }`;

  const data = await shopifyFetch(query, { query: searchQuery, first });
  return data.search.edges.map((e) => e.node);
}

// ── Mapper ─────────────────────────────────────
function mapShopifyProduct(node) {
  const variant = node.variants?.edges?.[0]?.node;
  const image = node.images?.edges?.[0]?.node;
  return {
    id: node.id,
    title: node.title,
    handle: node.handle,
    description: node.description || "",
    descriptionHtml: node.descriptionHtml || "",
    productType: node.productType || "",
    tags: node.tags || [],
    price: parseFloat(node.priceRange?.minVariantPrice?.amount || 0),
    compareAtPrice: parseFloat(
      node.compareAtPriceRange?.minVariantPrice?.amount || 0,
    ),
    image: image?.url || "",
    imageAlt: image?.altText || node.title,
    images: (node.images?.edges || []).map((e) => ({
      url: e.node.url,
      alt: e.node.altText,
    })),
    variantId: variant?.id || "",
    available: variant?.availableForSale ?? true,
    variants: (node.variants?.edges || []).map((e) => e.node),
  };
}

function fmtBRL(v) {
  return parseFloat(v).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// ── Demo products ──────────────────────────────
const DEMO_PRODUCTS = [
  {
    id: "demo-1",
    title: "Reserva Especial",
    handle: "reserva-especial",
    description:
      "Vinho encorpado com notas de frutas vermelhas e toque refinado de carvalho. Envelhecido 18 meses em barris de carvalho francês, apresenta taninos sedosos e longa persistência. Ideal para acompanhar carnes vermelhas e queijos curados.",
    descriptionHtml:
      "<p>Vinho encorpado com notas de frutas vermelhas e toque refinado de carvalho.</p><p>Envelhecido 18 meses em barris de carvalho francês, apresenta taninos sedosos e longa persistência. Ideal para acompanhar carnes vermelhas e queijos curados.</p>",
    productType: "Vinho Tinto",
    tags: ["Elegante", "Estruturado", "Persistente"],
    price: 289,
    compareAtPrice: 0,
    variantId: "demo-var-1",
    available: true,
    image: "assets/images/vinho1.webp",
    imageAlt: "Reserva Especial",
    images: [{ url: "assets/images/vinho1.webp", alt: "Reserva Especial" }],
    variants: [
      {
        id: "demo-var-1",
        title: "Padrão",
        availableForSale: true,
        price: { amount: "289", currencyCode: "BRL" },
      },
    ],
  },
  {
    id: "demo-2",
    title: "Safra Limitada",
    handle: "safra-limitada",
    description:
      "Edição especial cuidadosamente selecionada, com aroma sofisticado e final suave e marcante. Produção limitada a 3.000 garrafas, certificada pelo produtor. Notas de ameixa, especiarias e chocolate amargo.",
    descriptionHtml:
      "<p>Edição especial cuidadosamente selecionada, com aroma sofisticado e final suave e marcante.</p><p>Produção limitada a 3.000 garrafas, certificada pelo produtor. Notas de ameixa, especiarias e chocolate amargo.</p>",
    productType: "Vinho Tinto",
    tags: ["Exclusivo", "Refinado", "Limitado"],
    price: 349,
    compareAtPrice: 420,
    variantId: "demo-var-2",
    available: true,
    image: "assets/images/vinho2.webp",
    imageAlt: "Safra Limitada",
    images: [{ url: "assets/images/vinho2.webp", alt: "Safra Limitada" }],
    variants: [
      {
        id: "demo-var-2",
        title: "Padrão",
        availableForSale: true,
        price: { amount: "349", currencyCode: "BRL" },
      },
    ],
  },
  {
    id: "demo-3",
    title: "Grand Selection",
    handle: "grand-selection",
    description:
      "O ápice da sofisticação, com corpo intenso, aroma marcante e equilíbrio perfeito para ocasiões memoráveis. Blend exclusivo de uvas selecionadas manualmente. Medalhista em concursos internacionais.",
    descriptionHtml:
      "<p>O ápice da sofisticação, com corpo intenso, aroma marcante e equilíbrio perfeito para ocasiões memoráveis.</p><p>Blend exclusivo de uvas selecionadas manualmente. Medalhista em concursos internacionais.</p>",
    productType: "Vinho Tinto",
    tags: ["Premium", "Intenso", "Sofisticado"],
    price: 429,
    compareAtPrice: 0,
    variantId: "demo-var-3",
    available: true,
    image: "assets/images/vinho3.webp",
    imageAlt: "Grand Selection",
    images: [{ url: "assets/images/vinho3.webp", alt: "Grand Selection" }],
    variants: [
      {
        id: "demo-var-3",
        title: "Padrão",
        availableForSale: true,
        price: { amount: "429", currencyCode: "BRL" },
      },
    ],
  },
  {
    id: "demo-4",
    title: "Clássico Seco",
    handle: "classico-seco",
    description:
      "Vinho clássico e elegante, ideal para acompanhar jantares. Equilíbrio perfeito entre acidez refrescante e mineralidade. Notas cítricas, maçã verde e toque floral. Servir bem gelado a 8–10°C.",
    descriptionHtml:
      "<p>Vinho clássico e elegante, ideal para acompanhar jantares.</p><p>Equilíbrio perfeito entre acidez refrescante e mineralidade. Notas cítricas, maçã verde e toque floral. Servir bem gelado a 8–10°C.</p>",
    productType: "Vinho Branco",
    tags: ["Clássico", "Elegante", "Versátil"],
    price: 199,
    compareAtPrice: 0,
    variantId: "demo-var-4",
    available: true,
    image: "assets/images/vinho4.webp",
    imageAlt: "Clássico Seco",
    images: [{ url: "assets/images/vinho4.webp", alt: "Clássico Seco" }],
    variants: [
      {
        id: "demo-var-4",
        title: "Padrão",
        availableForSale: true,
        price: { amount: "199", currencyCode: "BRL" },
      },
    ],
  },
  {
    id: "demo-5",
    title: "Vinha Antiga",
    handle: "vinha-antiga",
    description:
      "Safra limitada de vinhedos centenários. Pura tradição em cada gole, com complexidade e personalidade únicos que só vinhas de mais de 80 anos conseguem entregar. Taninos maduros e final eterno.",
    descriptionHtml:
      "<p>Safra limitada de vinhedos centenários.</p><p>Pura tradição em cada gole, com complexidade e personalidade únicos que só vinhas de mais de 80 anos conseguem entregar. Taninos maduros e final eterno.</p>",
    productType: "Vinho Tinto",
    tags: ["Raro", "Tradicional", "Centenário"],
    price: 499,
    compareAtPrice: 0,
    variantId: "demo-var-5",
    available: true,
    image: "assets/images/vinho5.webp",
    imageAlt: "Vinha Antiga",
    images: [{ url: "assets/images/vinho5.webp", alt: "Vinha Antiga" }],
    variants: [
      {
        id: "demo-var-5",
        title: "Padrão",
        availableForSale: true,
        price: { amount: "499", currencyCode: "BRL" },
      },
    ],
  },
  {
    id: "demo-6",
    title: "Elegance Rosé",
    handle: "elegance-rose",
    description:
      "Vinho rosé leve, fresco e perfeito para celebrações. Notas de frutas silvestres, melancia e pétalas de rosa. Final delicado e persistente. Perfeito para aperitivos e frutos do mar.",
    descriptionHtml:
      "<p>Vinho rosé leve, fresco e perfeito para celebrações.</p><p>Notas de frutas silvestres, melancia e pétalas de rosa. Final delicado e persistente. Perfeito para aperitivos e frutos do mar.</p>",
    productType: "Vinho Rosé",
    tags: ["Fresco", "Delicado", "Festivo"],
    price: 259,
    compareAtPrice: 0,
    variantId: "demo-var-6",
    available: true,
    image: "assets/images/vinho6.webp",
    imageAlt: "Elegance Rosé",
    images: [{ url: "assets/images/vinho6.webp", alt: "Elegance Rosé" }],
    variants: [
      {
        id: "demo-var-6",
        title: "Padrão",
        availableForSale: true,
        price: { amount: "259", currencyCode: "BRL" },
      },
    ],
  },
];
