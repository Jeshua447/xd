let cart = []; // El carrito ahora almacena objetos de producto
const CURRENCY_SYMBOL = ' MXN'; // Símbolo de moneda para el display

// --- Funciones del Carrito ---

// Actualiza el contador de artículos en el icono del carrito
function updateCartDisplay() {
    const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelector('.cart-count').textContent = totalItemsInCart;
}

// Agrega un producto al carrito
function addToCart(productName, price, icon, event) {
    // Busca si el producto ya existe en el carrito
    const existingItem = cart.find(item => item.name === productName);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: Date.now(), // ID único simple para cada artículo (para el cliente)
            name: productName,
            price: price,
            icon: icon,
            quantity: 1
        });
    }

    updateCartDisplay(); // Actualiza el número en el icono del carrito

    // Animación para el botón "Agregar al Carrito"
    const button = event.target;
    const originalText = button.textContent;
    const originalBackground = button.style.background; // Guarda el fondo original

    button.textContent = '¡Agregado! ✓';
    button.style.background = 'linear-gradient(45deg, #27ae60, #2ecc71)'; // Color de éxito

    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = originalBackground; // Vuelve al color original
    }, 2000);

    showNotification(`${productName} agregada al carrito`);
}

// Alterna la visibilidad de la sección del carrito
// Ahora acepta un argumento opcional `scrollToTarget` para desplazar a una sección específica
function toggleCart(scrollToTarget = null) {
    const cartSection = document.getElementById('carrito');
    const otherSections = document.querySelectorAll('main > section:not(#carrito)'); // Todas las secciones excepto el carrito

    if (cartSection.classList.contains('active')) {
        // Ocultar carrito
        cartSection.classList.remove('active');
        otherSections.forEach(section => section.style.display = 'block'); // Vuelve a mostrar todas las secciones

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
                section.classList.add('active-view'); // Marca la sección que estaba visible
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

    if (cart.length === 0) {
        cartContent.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <h3>Tu carrito está vacío</h3>
                <p style="color: #666; margin-bottom: 2rem;">¡Agrega algunos productos increíbles!</p>
                <a href="#productos" class="button primary-button continue-shopping" onclick="toggleCart('#productos')">Continuar Comprando</a>
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
            removeFromCart(itemId); // Elimina si la cantidad llega a 0 o menos
            return;
        }
        updateCartDisplay();
        renderCart(); // Vuelve a renderizar para que los cambios se vean
    }
}

// Elimina un producto del carrito
function removeFromCart(itemId) {
    const itemIndex = cart.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
        const removedItem = cart[itemIndex];
        cart.splice(itemIndex, 1);
        updateCartDisplay();
        renderCart(); // Vuelve a renderizar para que los cambios se vean
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

    cart = []; // Vacía el carrito
    updateCartDisplay();
    renderCart(); // Vuelve a renderizar para mostrar el mensaje de carrito vacío
}

// --- Funciones de Utilidad / Notificaciones ---

// Muestra una notificación temporal
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification'; // Usa la clase CSS para estilos y animaciones
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000); // La notificación desaparece después de 3 segundos
}

// --- Inicialización y Manejo de Eventos del DOM ---

document.addEventListener('DOMContentLoaded', () => {
    // Adjuntar event listener para los botones "Agregar al Carrito"
    document.querySelectorAll('.buy-button').forEach(button => {
        button.addEventListener('click', function(event) {
            // Obtener los datos del producto de los atributos 'data-'
            const productName = this.dataset.name;
            const productPrice = parseFloat(this.dataset.price);
            const productIcon = this.dataset.icon;
            addToCart(productName, productPrice, productIcon, event);
        });
    });

    // Manejo del envío del formulario de venta
    document.getElementById('sellForm').addEventListener('submit', function(e) {
        e.preventDefault(); // Previene el envío por defecto del formulario

        // Simula la recolección de datos del formulario
        const formData = new FormData(this);
        const productData = {};
        for (let [key, value] of formData.entries()) {
            productData[key] = value;
        }

        // Aquí podrías enviar 'productData' a un servidor real
        console.log('Datos de la gorra a publicar:', productData);

        showNotification('¡Tu gorra ha sido publicada exitosamente!');
        this.reset(); // Limpia el formulario después del envío
    });

    // Manejo del envío del formulario de contacto (ejemplo, sin funcionalidad real)
    document.querySelector('.contact-form').addEventListener('submit', function(e) {
        e.preventDefault();
        showNotification('¡Mensaje enviado! Nos pondremos en contacto pronto.');
        this.reset();
    });

    // Desplazamiento suave para los enlaces de navegación
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Solo previene el comportamiento por defecto si NO es el icono del carrito
            // Y si no es el enlace de "Continuar Comprando" dentro del carrito (que ya lo maneja toggleCart)
            if (!this.classList.contains('cart-icon') && !this.classList.contains('continue-shopping')) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    // Si se está mostrando el carrito, ocúltalo primero
                    const cartSection = document.getElementById('carrito');
                    if (cartSection.classList.contains('active')) {
                        // Antes de ocultar, pasamos el destino del scroll a toggleCart
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
