// Product Data
const products = [
  { id: 1, name: 'Air Max 270', brand: 'Nike', price: 150, image: 'https://static.ftshp.digital/img/p/1/2/8/4/0/5/2/1284052.jpg ' },
  { id: 2, name: 'Ultraboost 22', brand: 'Adidas', price: 190, image: 'https://assets.adidas.com/images/w_1880,f_auto,q_auto/b9bd6dc6bbb84a8faa3dae8400320b3e_9366/GX6632_01_00_standard.jpg' },
  { id: 3, name: 'Classic Leather', brand: 'Reebok', price: 80, image: 'https://www.reebok.com/cdn/shop/files/100008491_SLC_eCom-tif.png' },
  { id: 4, name: 'Air Jordan 1', brand: 'Nike', price: 170, image: ' https://images.laced.com/products/2a5e2a26-4e80-49c6-a26b-d3e170dbe1e3.jpg' },
  { id: 5, name: 'Stan Smith', brand: 'Adidas', price: 90, image: ' https://images.unsplash.com/photo-1544441892-794166f1e3be?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: 6, name: 'Sk8-Hi', brand: 'Vans', price: 60, image: 'https://static.ftshp.digital/img/p/2/2/8/6/9/22869-full_product.jpg ' }
];

// DOM Elements
const productGrid = document.getElementById('productGrid');
const searchInput = document.getElementById('searchInput');

// Function to render products
function renderProducts(filteredProducts) {
  productGrid.innerHTML = ''; // Clear existing

  if (filteredProducts.length === 0) {
    productGrid.innerHTML = '<p class="col-span-full text-center text-gray-500">No products found.</p>';
    return;
  }

  filteredProducts.forEach(product => {
    const productHTML = `
          <div class="bg-white rounded-lg shadow hover:shadow-xl transition overflow-hidden">
            <img src="${product.image}" alt="${product.name}" class="w-full h-64 object-cover">
            <div class="p-4">
              <h3 class="font-semibold text-lg">${product.name}</h3>
              <p class="text-sm text-gray-600">${product.brand}</p>
              <div class="flex justify-between items-center mt-2">
                <span class="text-indigo-600 font-bold">$${product.price}</span>
                <button class="add-to-cart bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 active:scale-95 transition" data-id="${product.id}">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        `;
    productGrid.innerHTML += productHTML;
  });
}

// Initial render
renderProducts(products);

// Filter on input
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.brand.toLowerCase().includes(query)
  );
  renderProducts(filtered);
});

// CART LOGIC
const cart = [];

function addToCart(product) {
  const existingItem = cart.find(item => item.id === product.id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  popupNotification();
  updateCartUI();
}

function updateCartItem(id, newQty) {
  const item = cart.find(i => i.id === id);
  if (item) {
    item.quantity = newQty;
    if (item.quantity <= 0) {
      removeFromCart(id);
    }
    updateCartUI();
  }
}

function removeFromCart(id) {
  const index = cart.findIndex(i => i.id === id);
  if (index > -1) {
    cart.splice(index, 1);
  }
  updateCartUI();
}

function updateCartUI() {
  const cartItemsContainer = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  const cartCount = document.getElementById('cartCount');

  cartItemsContainer.innerHTML = '';

  let total = 0;

  cart.forEach(item => {
    total += item.price * item.quantity;

    const itemHTML = `
        <div class="flex justify-between border-b pb-2">
          <div>
            <p class="font-semibold">${item.name}</p>
            <p class="text-sm text-gray-600">$${item.price} x ${item.quantity}</p>
          </div>
          <div class="flex items-center space-x-2">
            <input type="number" min="1" value="${item.quantity}" onchange="updateCartItem(${item.id}, parseInt(this.value))" class="w-12 text-center border rounded">
            <button onclick="removeFromCart(${item.id})" class="text-red-500"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      `;
    cartItemsContainer.innerHTML += itemHTML;
  });

  cartTotal.textContent = `Total: $${total.toFixed(2)}`;
  cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

function openCart() {
  document.getElementById('cartModal').classList.remove('hidden');
  document.getElementById('cartModal').classList.add('flex');

}

function closeCart() {
  document.getElementById('cartModal').classList.add('hidden');
}

function popupNotification() {
  const notificationBar = document.getElementById('notificationBar');
  const notification = document.getElementById('notification');
  notification.classList.remove('hidden');

  let duration = 4000;
  let interval = 10;
  let elapsed = 0;

  // Start progress bar timer
  const timer = setInterval(() => {
    elapsed += interval;
    console.log(`Elapsed: ${elapsed}ms, Duration: ${duration}ms`);
    
    const progress = 100 - (elapsed * 100) / duration;
    notificationBar.style.width = progress + '%';

    if (elapsed >= duration) {
      clearInterval(timer); // Important to stop the interval
    }
  }, interval);

  // Hide after duration
  setTimeout(() => {
    notification.classList.add('hidden');
  }, duration);
}


// Attach click event to dynamically generated buttons
document.addEventListener('click', function (e) {
  if (e.target.closest('.add-to-cart')) {
    const button = e.target.closest('.add-to-cart');
    const productId = parseInt(button.dataset.id);
    const product = products.find(p => p.id === productId);
    if (product) {
      addToCart(product);
    }
  }
});

// Stripe Checkout

let stripe = null;

// Initialize Stripe with your publishable key
document.addEventListener("DOMContentLoaded", function () {
  stripe = Stripe("pk_test_51RkEvq2fk2Hwk84plovHZaJDuiloHvq68mppDgm33GV8PToN8nyhWfCDcVztFW5wSSl6fW5krjej1boq4MQhryZV003DQjj3Cb"); // Replace with your real key
});

async function checkout() {
  const cartItems = cart.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.name,
        images: [item.image.trim()],
      },
      unit_amount: Math.round(Number(item.price) * 100),
    },
    quantity: item.quantity,
  }));
  if (cartItems.length === 0) {
    alert('Your cart is empty!');
    return;
  }
  console.log("Sending to /create-checkout-session:", cartItems);


  try {
    const response = await fetch('/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items: cartItems }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Checkout failed:', text);
      alert('Checkout failed again. Check console for details.');
      return;
    }
    const session = await response.json();

    // Redirect to Stripe Checkout
    const { error } = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (error) {
      console.error('Stripe Checkout error:', error);
      alert('Error opening checkout');
    }
  } catch (err) {
    console.error(err);
    alert('Failed to start checkout.');
  }
}
