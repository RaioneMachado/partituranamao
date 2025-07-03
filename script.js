document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', function() {
            mainNav.classList.toggle('active');
        });
    }
    
    // Header Scroll Effect
    const header = document.querySelector('.main-header');
    
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
    
    // Search Functionality
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const instrumentCards = document.querySelectorAll('.instrument-card');
    
    if (searchInput && searchBtn && instrumentCards.length > 0) {
        function filterInstruments() {
            const searchTerm = searchInput.value.toLowerCase();
            
            instrumentCards.forEach(card => {
                const instrumentName = card.getAttribute('data-instrument').toLowerCase();
                const cardText = card.textContent.toLowerCase();
                
                if (instrumentName.includes(searchTerm) || cardText.includes(searchTerm)) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        }
        
        searchBtn.addEventListener('click', filterInstruments);
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                filterInstruments();
            }
        });
    }

    // Cart Functionality
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function updateCartCount() {
        const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
        const cartLink = document.querySelector('a[href="carrinho.html"]');
        
        if (cartLink) {
            if (cartCount > 0) {
                const countBadge = cartLink.querySelector('.cart-count') || document.createElement('span');
                countBadge.className = 'cart-count';
                countBadge.textContent = cartCount;
                
                if (!cartLink.querySelector('.cart-count')) {
                    cartLink.appendChild(countBadge);
                }
            } else {
                const countBadge = cartLink.querySelector('.cart-count');
                if (countBadge) {
                    countBadge.remove();
                }
            }
        }
    }

    function setupAddToCartButtons() {
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        
        addToCartButtons.forEach(button => {
            button.removeEventListener('click', addToCartHandler);
            button.addEventListener('click', addToCartHandler);
        });
    }

    function addToCartHandler() {
        const card = this.closest('.sheet-music-card');
        if (!card) return;
        
        const itemId = card.getAttribute('data-id');
        const itemName = card.querySelector('h3').textContent;
        const priceText = card.querySelector('.price').textContent;
        const itemImage = card.querySelector('.sheet-music-image img')?.src || '';
        
        const itemPrice = parseFloat(
            priceText.replace(/[^\d,]/g, '').replace(',', '.')
        );
        
        if (isNaN(itemPrice)) {
            console.error('Preço inválido:', priceText);
            return;
        }
        
        const existingItemIndex = cart.findIndex(item => item.id === itemId);
        
        if (existingItemIndex !== -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            cart.push({
                id: itemId,
                name: itemName,
                price: itemPrice,
                image: itemImage,
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showModal('Item Adicionado', `${itemName} foi adicionado ao seu carrinho.`);
    }

    function showModal(title, message) {
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) existingModal.remove();
        
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p>${message}</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" id="go-to-cart">Ver Carrinho</button>
                <button class="btn btn-gold modal-close">Continuar Comprando</button>
            </div>
        `;
        
        modalOverlay.appendChild(modal);
        document.body.appendChild(modalOverlay);
        
        setTimeout(() => {
            modalOverlay.classList.add('active');
        }, 10);
        
        const closeButtons = modalOverlay.querySelectorAll('.modal-close');
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                modalOverlay.classList.remove('active');
                setTimeout(() => {
                    modalOverlay.remove();
                }, 300);
            });
        });
        
        const goToCartBtn = modalOverlay.querySelector('#go-to-cart');
        if (goToCartBtn) {
            goToCartBtn.addEventListener('click', function() {
                window.location.href = 'carrinho.html';
            });
        }
    }

    // Cart Page Functionality
    if (document.querySelector('.cart-page')) {
        renderCart();
        
        // Delegar eventos para elementos dinâmicos
        document.addEventListener('click', function(e) {
            // Verificar se o clique foi no botão de remover ou no ícone dentro dele
            const removeButton = e.target.closest('.remove-item');
            if (removeButton) {
                const itemId = removeButton.closest('tr').getAttribute('data-id');
                removeCartItem(itemId);
                return;
            }
            
            // Quantity controls
            if (e.target.classList.contains('quantity-btn')) {
                const input = e.target.parentNode.querySelector('.quantity-input');
                let quantity = parseInt(input.value);
                
                if (e.target.classList.contains('decrease')) {
                    quantity = Math.max(1, quantity - 1);
                } else {
                    quantity++;
                }
                
                input.value = quantity;
                updateCartItem(e.target.closest('tr').getAttribute('data-id'), quantity);
            }
        });
    }

    function renderCart() {
        const cartTableBody = document.querySelector('.cart-table tbody');
        const cartSummary = document.querySelector('.cart-summary');
        const emptyCart = document.querySelector('.empty-cart');
        
        if (cart.length === 0) {
            if (cartTableBody) cartTableBody.innerHTML = '';
            if (emptyCart) emptyCart.style.display = 'block';
            if (cartSummary) cartSummary.style.display = 'none';
            return;
        }
        
        if (emptyCart) emptyCart.style.display = 'none';
        if (cartSummary) cartSummary.style.display = 'block';
        
        if (cartTableBody) {
            cartTableBody.innerHTML = '';
            
            cart.forEach(item => {
                const row = document.createElement('tr');
                row.setAttribute('data-id', item.id);
                
                row.innerHTML = `
                    <td>
                        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    </td>
                    <td>${item.name}</td>
                    <td>R$ ${item.price.toFixed(2).replace('.', ',')}</td>
                    <td>
                        <div class="quantity-control">
                            <button type="button" class="quantity-btn decrease">-</button>
                            <input type="number" class="quantity-input" value="${item.quantity}" min="1">
                            <button type="button" class="quantity-btn increase">+</button>
                        </div>
                    </td>
                    <td>R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</td>
                    <td><button type="button" class="remove-item"><i class="fas fa-times"></i></button></td>
                `;
                
                cartTableBody.appendChild(row);
            });
        }
        
        if (cartSummary) {
            const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
            const discount = 0;
            const total = subtotal - discount;
            
            document.querySelector('.subtotal-amount').textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
            document.querySelector('.discount-amount').textContent = `- R$ ${discount.toFixed(2).replace('.', ',')}`;
            document.querySelector('.total-amount').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        }
    }

    function updateCartItem(itemId, quantity) {
        const item = cart.find(item => item.id === itemId);
        if (item) {
            item.quantity = quantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
        }
    }

    function removeCartItem(itemId) {
        cart = cart.filter(item => item.id !== itemId);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
        updateCartCount();
    }

    // Difficulty Filter on Instrument Pages
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    
    if (difficultyButtons.length > 0) {
        difficultyButtons.forEach(button => {
            button.addEventListener('click', function() {
                difficultyButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                const difficulty = this.getAttribute('data-difficulty');
                filterSheetMusic(difficulty);
            });
        });
    }
    
    function filterSheetMusic(difficulty) {
        const sheetMusicCards = document.querySelectorAll('.sheet-music-card');
        
        sheetMusicCards.forEach(card => {
            const cardDifficulty = card.getAttribute('data-difficulty');
            
            if (difficulty === 'all' || cardDifficulty === difficulty) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 50);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    }
    
    // Search Functionality in Instrument Pages
    const instrumentSearchInput = document.querySelector('.instrument-search-input');
    const instrumentSearchBtn = document.querySelector('.instrument-search-btn');
    
    if (instrumentSearchInput && instrumentSearchBtn) {
        instrumentSearchBtn.addEventListener('click', filterSheetMusicBySearch);
        instrumentSearchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                filterSheetMusicBySearch();
            }
        });
        
        function filterSheetMusicBySearch() {
            const searchTerm = instrumentSearchInput.value.toLowerCase();
            const sheetMusicCards = document.querySelectorAll('.sheet-music-card');
            
            sheetMusicCards.forEach(card => {
                const musicName = card.querySelector('h3').textContent.toLowerCase();
                const composer = card.querySelector('.sheet-music-meta span:first-child').textContent.toLowerCase();
                
                if (musicName.includes(searchTerm) || composer.includes(searchTerm)) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        }
    }
    
    // Inicialização
    updateCartCount();
    setupAddToCartButtons();
});