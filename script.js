let cart = []; // El carrito ahora almacena objetos de producto
const CURRENCY_SYMBOL = ' MXN'; // Símbolo de moneda para el display

// --- Funciones del Carrito ---

// Actualiza el contador de artículos en el icono del carrito
function updateCartDisplay() {
    const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalItemsInCart;
        cartCountElement.style.display = totalItemsInCart > 0 ? 'flex' : 'none';
    }
}

// Agrega un producto al carrito - FUNCIÓN CORREGIDA
function addToCart(productName, price, icon) {
    // Validar parámetros
    if (!productName || !price || !icon) {
        console.error('Error: Parámetros inválidos para agregar al carrito', {
            productName,
            price,
            icon
        });
        showNotification('Error al agregar producto al carrito');
        return;
    }

    // Validar que el precio sea un número válido
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
        console.error('Error: Precio inválido', price);
        showNotification('Error: Precio inválido');
        return;
    }

    // Busca si el producto ya existe en el carrito
    const existingItem = cart.find(item => item.name === productName);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: Date.now(), // ID único simple para cada artículo
            name: productName,
            price: numericPrice,
            icon: icon,
            quantity: 1
        });
    }

    updateCartDisplay(); // Actualiza el número en el icono del carrito

    // Animación para el botón "Agregar al Carrito"
    // Buscar el botón que se clickeó usando el nombre del producto
    const buttons = document.querySelectorAll('.buy-button');
    let targetButton = null;
    
    buttons.forEach(button => {
        const buttonText = button.getAttribute('onclick');
        if (buttonText && buttonText.includes(productName)) {
            targetButton = button;
        }
    });

    if (targetButton) {
        const originalText = targetButton.textContent;
        const originalBackground = targetButton.style.background;

        targetButton.textContent = '¡Agregado! ✓';
        targetButton.style.background = 'linear-gradient(45deg, #27ae60, #2ecc71)';

        setTimeout(() => {
            targetButton.textContent = originalText;
            targetButton.style.background = originalBackground;
        }, 2000);
    }

    showNotification(`${productName} agregada al carrito`);
}

// Alterna la visibilidad de la sección del carrito
function toggleCart(scrollToTarget = null) {
    const cartSection = document.getElementById('carrito');
    const otherSections = document.querySelectorAll('main > section:not(#carrito)');

    if (cartSection.classList.contains('active')) {
        // Ocultar carrito
        cartSection.classList.remove('active');
        otherSections.forEach(section => section.style.display = 'block');

        // Si se especificó un objetivo de scroll, vamos a él
        if (scrollToTarget) {
            const targetElement = document.querySelector(scrollToTarget);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            // Si no hay un objetivo específico y se estaba mostrando una sección, vuelve a esa
            const activeSection = document.querySelector('section.active-view');
            if (activeSection) {
                activeSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
        // Limpiamos la clase 'active-view' después de usarla
        otherSections.forEach(section => section.classList.remove('active-view'));

    } else {
        // Ocultar otras secciones y mostrar carrito
        otherSections.forEach(section => {
            if (section.style.display !== 'none') {
                section.classList.add('active-view');
            }
            section.style.display = 'none';
        });
        cartSection.classList.add('active');
        renderCart(); // Renderiza el carrito cuando se muestra
    }
}

// Renderiza el contenido del carrito
function renderCart() {
    const cartContent = document.getElementById('cart-content');
    
    if (!cartContent) {
        console.error('Error: Elemento cart-content no encontrado');
        return;
    }

    if (cart.length === 0) {
        cartContent.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <h3>Tu carrito está vacío</h3>
                <p style="color: #666; margin-bottom: 2rem;">¡Agrega algunos productos increíbles!</p>
                <a href="#productos" class="continue-shopping" onclick="toggleCart('#productos')">Continuar Comprando</a>
            </div>
        `;
        return;
    }

    const cartItemsHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-icon">${item.icon}</div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">$${item.price.toLocaleString()}${CURRENCY_SYMBOL}</div>
                </div>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="changeQuantity(${item.id}, -1)">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="changeQuantity(${item.id}, 1)">+</button>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">Eliminar</button>
            </div>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    cartContent.innerHTML = `
        <div class="cart-items">
            ${cartItemsHTML}
        </div>
        <div class="cart-summary">
            <div class="cart-total">
                Total: <span class="cart-total-price">$${total.toLocaleString()}${CURRENCY_SYMBOL}</span>
            </div>
            <p style="color: #666; margin-bottom: 1rem;">${totalItems} producto${totalItems !== 1 ? 's' : ''} en tu carrito</p>
            <button class="checkout-btn" onclick="checkout()">Proceder al Pago 🚀</button>
            <br><br>
            <a href="#productos" class="continue-shopping" onclick="toggleCart('#productos')" style="font-size: 0.9rem;">← Continuar Comprando</a>
        </div>
    `;
}

// Cambia la cantidad de un producto en el carrito
function changeQuantity(itemId, change) {
    const item = cart.find(item => item.id === itemId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
            return;
        }
        updateCartDisplay();
        renderCart();
    }
}

// Elimina un producto del carrito
function removeFromCart(itemId) {
    const itemIndex = cart.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
        const removedItem = cart[itemIndex];
        cart.splice(itemIndex, 1);
        updateCartDisplay();
        renderCart();
        showNotification(`${removedItem.name} eliminada del carrito`);
    }
}

// Simula el proceso de pago
function checkout() {
    if (cart.length === 0) {
        showNotification('Tu carrito está vacío. ¡Agrega productos para comprar!');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    showNotification(`¡Compra realizada por $${total.toLocaleString()}${CURRENCY_SYMBOL}! Gracias por tu compra 🎉`);

    cart = [];
    updateCartDisplay();
    renderCart();
}

// --- Funciones de Utilidad / Notificaciones ---

// Muestra una notificación temporal
function showNotification(message) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(45deg, #4ecdc4, #44a08d);
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 1000;
        font-weight: bold;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);

    // Animar salida y eliminar
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// --- Inicialización y Manejo de Eventos del DOM ---

document.addEventListener('DOMContentLoaded', () => {
    // Manejo del envío del formulario de venta
    const sellForm = document.getElementById('sellForm');
    if (sellForm) {
        sellForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Simula la recolección de datos del formulario
            const formData = new FormData(this);
            const productData = {};
            for (let [key, value] of formData.entries()) {
                productData[key] = value;
            }

            console.log('Datos de la gorra a publicar:', productData);
            showNotification('¡Tu gorra ha sido publicada exitosamente!');
            this.reset();
        });
    }

    // Desplazamiento suave para los enlaces de navegación
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if (!this.classList.contains('cart-icon') && !this.classList.contains('continue-shopping')) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const cartSection = document.getElementById('carrito');
                    if (cartSection && cartSection.classList.contains('active')) {
                        toggleCart(this.getAttribute('href'));
                    } else {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            }
        });
    });

    // Actualización inicial del display del carrito al cargar la página
    updateCartDisplay();
});
