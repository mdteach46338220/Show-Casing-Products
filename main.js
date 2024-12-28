const allProductsUrl = "products.json";

// Utility function to select elements
const getElement = (selection) => {
  const element = document.querySelector(selection);
  if (element) return element;
  throw new Error(`Please check "${selection}" selector, no such element exists`);
};

// DOM Elements
const cartBtn = getElement('.cart-btn');
const closeCartBtn = getElement('.close-cart');
const clearCartBtn = getElement('.clear-cart');
const cartDOM = getElement('.cart');
const cartOverlay = getElement('.cart-overlay');
const cartTotal = getElement('.cart-total');
const cartItems = getElement('.cart-items');
const cartContent = getElement('.cart-content');
const productsDOM = getElement('.products-center');

// Local Storage Functions
const getStorageItem = (item) => {
  let storageItem = localStorage.getItem(item);
  return storageItem ? JSON.parse(storageItem) : [];
};

const setStorageItem = (name, item) => {
  localStorage.setItem(name, JSON.stringify(item));
};

// Price Formatting Function
const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format((price / 100).toFixed(2));
};

// Cart Toggle Functions
cartBtn.addEventListener('click', () => {
  cartOverlay.classList.add('transparentBcg');
  cartDOM.classList.add('showCart');
});

closeCartBtn.addEventListener('click', () => {
  cartOverlay.classList.remove('transparentBcg');
  cartDOM.classList.remove('showCart');
});

// Cart Management
let cart = getStorageItem('cart');

const addToCart = (id) => {
  const item = cart.find((cartItem) => cartItem.id === id);
  if (!item) {
    const product = getStorageItem('store').find((product) => product.id === id);
    product.amount = 1;
    cart = [...cart, product];
    displayCartItem(product);
  } else {
    const amount = increaseAmount(id);
    const items = [...cartContent.querySelectorAll('.item-amount')];
    const newAmount = items.find((value) => value.dataset.id === id);
    newAmount.textContent = amount;
  }
  displayCartTotal();
  displayCartItemCount();
  setStorageItem('cart', cart);
  openCart();
};

const removeItem = (id) => {
  cart = cart.filter((cartItem) => cartItem.id !== id);
};

const increaseAmount = (id) => {
  let newAmount;
  cart = cart.map((cartItem) => {
    if (cartItem.id === id) {
      newAmount = cartItem.amount + 1;
      cartItem.amount = newAmount;
    }
    return cartItem;
  });
  return newAmount;
};

const decreaseAmount = (id) => {
  let newAmount;
  cart = cart.map((cartItem) => {
    if (cartItem.id === id) {
      newAmount = cartItem.amount - 1;
      cartItem.amount = newAmount;
    }
    return cartItem;
  });
  return newAmount;
};

// Cart Display Functions
const displayCartItemCount = () => {
  const amount = cart.reduce((total, cartItem) => total + cartItem.amount, 0);
  cartItems.textContent = amount;
};

const displayCartTotal = () => {
  const total = cart.reduce((total, cartItem) => total + (cartItem.price * cartItem.amount), 0);
  cartTotal.textContent = `${formatPrice(total)}`;
};

const displayCartItem = ({ id, image, amount, name, price }) => {
  const article = document.createElement('article');
  article.classList.add('cart-item');
  article.setAttribute('data-id', id);
  article.innerHTML = `
    <img src="${image}" alt="${name}"/>
    <div>
      <h4>${name}</h4>
      <h5>${formatPrice(price)}</h5>
      <span class="remove-item" data-id="${id}"><i class="far fa-trash-alt"></i></span>
    </div>
    <div>
      <i class="fas fa-plus" data-id="${id}"><font size="5rem">+</font></i>
      <p class="item-amount" data-id="${id}">${amount}</p>
      <i class="fas fa-minus" data-id="${id}"><font size="4rem">–</font></i>
    </div>`;
  cartContent.appendChild(article);
};

const displayCartItemDOM = () => {
  cart.forEach((cartItem) => displayCartItem(cartItem));
};

const setupCartFunctionality = () => {
  cartContent.addEventListener('click', (e) => {
    const element = e.target;
    const parent = element.parentElement;
    const parentID = element.dataset.id;

    // Remove item from cart
    if (parent.classList.contains('remove-item')) {
      removeItem(parentID);
      element.closest('.cart-item').remove();
    }

    // Increase item amount
    if (element.classList.contains('fa-plus')) {
      const newAmount = increaseAmount(parentID);
      element.nextElementSibling.textContent = newAmount;
    }

    // Decrease item amount
    if (element.classList.contains('fa-minus')) {
      const newAmount = decreaseAmount(parentID);
      if (newAmount === 0) {
        removeItem(parentID);
        element.closest('.cart-item').remove();
      } else {
        element.previousElementSibling.textContent = newAmount;
      }
    }
    displayCartItemCount();
    displayCartTotal();
    setStorageItem('cart', cart);
  });
};

// Cart Initialization
const CartInit = () => {
  displayCartItemCount();
  displayCartTotal();
  displayCartItemDOM();
  setupCartFunctionality();
};

CartInit();

// Fetching Products
const fetchProducts = async () => {
  const response = await fetch(allProductsUrl).catch((err) => console.log(err));
  if (response) return response.json();
  return response;
};

let store = getStorageItem('store');

const setupStore = (products) => {
  store = products.map((product) => {
    const { id, fields: { image: img, name, price } } = product;
    const image = img[0].thumbnails.large.url;
    return { id, image, name, price };
  });
  setStorageItem('store', store);
};

// Display Products
const displayProducts = (products, element) => {
  element.innerHTML = products.map((product) => {
    const { id, image, name, price } = product;
    return `
      <article class="product">
        <div class="img-container">
          <img class="product-img" src="${image}" alt="${name}"/>
          <button class="bag-btn" data-id="${id}"><i class="fas fa-shopping-basket"></i>add to cart</button>
        </div>
        <h3>${name}</h3>
        <h4>${formatPrice(price)}</h4>
      </article>`;
  }).join('');

  element.addEventListener('click', (e) => {
    const item = e.target;
    if (item.classList.contains('bag-btn')) {
      addToCart(item.dataset.id);
    }
  });
};

// Initialize Application
const init = async () => {
  const products = await fetchProducts();
  setupStore(products);
  displayProducts(store, productsDOM);
};

// Load application on DOMContentLoaded
window.addEventListener('DOMContentLoaded', init);
