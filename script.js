// Initialize cart from localStorage
function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Update cart count badge
function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badges = document.querySelectorAll('#cartCount');
    badges.forEach(badge => {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'inline' : 'none';
    });
}

// Add product to cart
function addToCart(id, name, price, image) {
    let cart = getCart();
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }

    saveCart(cart);
    
    // Show feedback
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '✓ Added!';
    btn.style.background = '#27ae60';
    
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
    }, 1000);
}

// Display cart items
function displayCart() {
    const cart = getCart();
    const cartItemsDiv = document.getElementById('cartItems');
    const emptyCartDiv = document.getElementById('emptyCart');
    const cartSummaryDiv = document.getElementById('cartSummary');

    if (cart.length === 0) {
        cartItemsDiv.style.display = 'none';
        cartSummaryDiv.style.display = 'none';
        emptyCartDiv.style.display = 'block';
        return;
    }

    emptyCartDiv.style.display = 'none';
    cartItemsDiv.style.display = 'block';
    cartSummaryDiv.style.display = 'block';

    let html = '';
    let total = 0;

    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;

        html += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p>₹${item.price}</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <div>
                    <p><strong>₹${subtotal}</strong></p>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            </div>
        `;
    });

    cartItemsDiv.innerHTML = html;
    document.getElementById('totalAmount').textContent = '₹' + total;
}

// Update item quantity
function updateQuantity(id, change) {
    let cart = getCart();
    const item = cart.find(item => item.id === id);

    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(item => item.id !== id);
        }
    }

    saveCart(cart);
    displayCart();
}

// Remove item from cart
function removeFromCart(id) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== id);
    saveCart(cart);
    displayCart();
}

// Display order summary on payment page
function displayOrderSummary() {
    const cart = getCart();
    const orderItemsDiv = document.getElementById('orderItems');
    const orderTotalSpan = document.getElementById('orderTotal');

    if (cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }

    let html = '';
    let total = 0;

    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;

        html += `
            <div class="order-item">
                <span>${item.name} x ${item.quantity}</span>
                <span>₹${subtotal}</span>
            </div>
        `;
    });

    orderItemsDiv.innerHTML = html;
    orderTotalSpan.textContent = '₹' + total;
}

// Place order
function placeOrder(event) {
    event.preventDefault();

    const cart = getCart();
    if (cart.length === 0) {
        alert('Your cart is empty!');
        window.location.href = 'products.html';
        return;
    }

    const form = document.getElementById('checkoutForm');
    const formData = new FormData(form);

    const orderData = {
        name: formData.get('name'),
        mobile: formData.get('mobile'),
        address: formData.get('address'),
        pincode: formData.get('pincode'),
        payment: formData.get('payment'),
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        orderId: Math.floor(100000 + Math.random() * 900000),
        timestamp: new Date().toISOString()
    };

    // Save order to localStorage
    localStorage.setItem('lastOrder', JSON.stringify(orderData));

    // Clear cart
    localStorage.setItem('cart', JSON.stringify([]));

    // Redirect to thank you page
    window.location.href = 'thankyou.html';
}

// Display order confirmation
function displayOrderConfirmation() {
    const lastOrder = localStorage.getItem('lastOrder');

    if (!lastOrder) {
        window.location.href = 'index.html';
        return;
    }

    const order = JSON.parse(lastOrder);
    document.getElementById('orderId').textContent = '#' + order.orderId;
    document.getElementById('orderAmount').textContent = '₹' + order.total;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
});
