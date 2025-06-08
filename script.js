document.addEventListener('DOMContentLoaded', () => {

    // --- DATA PRODUK ---
    const products = [
        { id: 1, name: 'Minyak Goreng Sania 2L', price: 35000, category: 'minyak' },
        { id: 2, name: 'Minyak Goreng Bimoli 1L', price: 20000, category: 'minyak' },
        { id: 3, name: 'Beras Rojolele 5kg', price: 68000, category: 'beras' },
        { id: 4, name: 'Beras Pandan Wangi 5kg', price: 75000, category: 'beras' },
        { id: 5, name: 'Gudang Garam Surya 16', price: 32000, category: 'rokok' },
        { id: 6, name: 'Djarum Super 12', price: 25000, category: 'rokok' },
        { id: 7, name: 'Susu Bendera Kaleng', price: 15000, category: 'susu' },
        { id: 8, name: 'Susu Ultra Coklat 1L', price: 19000, category: 'susu' },
        { id: 9, name: 'Sabun Lifebuoy Batang', price: 4000, category: 'sabun' },
        { id: 10, name: 'Sabun Lux Cair 450ml', price: 22000, category: 'sabun' },
    ];

    // --- STATE APLIKASI ---
    let cart = [];
    // Muat transaksi dari localStorage atau mulai dengan array kosong
    let transactions = JSON.parse(localStorage.getItem('sembakoTransactions')) || [];
    let currentFilter = 'all';
    let currentSearchTerm = '';
    let currentTotal = 0;

    // --- ELEMEN DOM ---
    const productListEl = document.getElementById('product-list');
    const cartItemsEl = document.getElementById('cart-items');
    const totalPriceEl = document.getElementById('total-price');
    const checkoutButton = document.getElementById('checkout-button');
    const searchInputEl = document.getElementById('search-input');
    const categoryFiltersEl = document.getElementById('category-filters');
    
    // Elemen Navigasi
    const navKasirBtn = document.getElementById('nav-kasir');
    const navRiwayatBtn = document.getElementById('nav-riwayat');
    const kasirSection = document.getElementById('kasir-section');
    const riwayatSection = document.getElementById('riwayat-section');

    // Elemen Riwayat & Pendapatan
    const historyListEl = document.getElementById('history-list');
    const dailyIncomeEl = document.getElementById('daily-income');

    // Elemen Modal & Struk (tetap sama)
    const paymentModalEl = document.getElementById('payment-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalTotalEl = document.getElementById('modal-total');
    const paymentInputEl = document.getElementById('payment-input');
    const changeDisplayEl = document.getElementById('change-display');
    const confirmPaymentBtn = document.getElementById('confirm-payment-btn');

    // --- FUNGSI ---
    const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

    const saveTransactions = () => {
        localStorage.setItem('sembakoTransactions', JSON.stringify(transactions));
    };

    const calculateTotal = () => cart.reduce((total, item) => total + (products.find(p => p.id === item.id).price * item.quantity), 0);

    const renderProducts = () => {
        productListEl.innerHTML = '';
        const filtered = products.filter(p => (currentFilter === 'all' || p.category === currentFilter) && p.name.toLowerCase().includes(currentSearchTerm.toLowerCase()));
        if (filtered.length === 0) {
            productListEl.innerHTML = '<p>Produk tidak ditemukan.</p>';
            return;
        }
        filtered.forEach(p => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `<h3>${p.name}</h3><p class="product-price">${formatCurrency(p.price)}</p>`;
            card.onclick = () => addToCart(p.id);
            productListEl.appendChild(card);
        });
    };

    const renderCart = () => {
        cartItemsEl.innerHTML = '';
        currentTotal = calculateTotal();

        if (cart.length === 0) {
            cartItemsEl.innerHTML = '<p class="empty-cart-message">Keranjang masih kosong.</p>';
            totalPriceEl.textContent = formatCurrency(0);
            checkoutButton.disabled = true;
            return;
        }

        cart.forEach(cartItem => {
            const product = products.find(p => p.id === cartItem.id);
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <div class="item-info"><p class="item-name">${product.name}</p><p class="item-price">${formatCurrency(product.price)} x ${cartItem.quantity}</p></div>
                <div class="item-controls"><button class="quantity-btn decrease-btn" data-id="${product.id}">-</button><span class="item-quantity">${cartItem.quantity}</span><button class="quantity-btn increase-btn" data-id="${product.id}">+</button></div>`;
            cartItemsEl.appendChild(itemEl);
        });

        totalPriceEl.textContent = formatCurrency(currentTotal);
        checkoutButton.disabled = false;
        
        cartItemsEl.querySelectorAll('.increase-btn').forEach(b => b.onclick = () => addToCart(parseInt(b.dataset.id)));
        cartItemsEl.querySelectorAll('.decrease-btn').forEach(b => b.onclick = () => decreaseQuantity(parseInt(b.dataset.id)));
    };

    const addToCart = (productId) => {
        const item = cart.find(i => i.id === productId);
        if (item) item.quantity++;
        else cart.push({ id: productId, quantity: 1 });
        renderCart();
    };

    const decreaseQuantity = (productId) => {
        const item = cart.find(i => i.id === productId);
        if (item) {
            item.quantity--;
            if (item.quantity === 0) cart = cart.filter(i => i.id !== productId);
        }
        renderCart();
    };
    
    // --- FUNGSI BARU: RIWAYAT & PENDAPATAN ---
    const renderHistory = () => {
        historyListEl.innerHTML = '';
        if (transactions.length === 0) {
            historyListEl.innerHTML = '<p class="empty-cart-message">Belum ada riwayat transaksi.</p>';
            return;
        }
        
        // Tampilkan dari yang terbaru
        [...transactions].reverse().forEach(tx => {
            const historyItem = document.createElement('details');
            historyItem.className = 'history-item';

            const itemsHtml = tx.items.map(item => {
                const product = products.find(p => p.id === item.id);
                return `
                    <div class="history-details-item">
                        <span>${product.name} (x${item.quantity})</span>
                        <span>${formatCurrency(product.price * item.quantity)}</span>
                    </div>
                `;
            }).join('');

            historyItem.innerHTML = `
                <summary>
                    <div>
                        <span class="history-summary-info">${tx.id}</span>
                        <span class="history-summary-time">${new Date(tx.date).toLocaleString('id-ID')}</span>
                    </div>
                    <span class="history-summary-total">${formatCurrency(tx.total)}</span>
                </summary>
                <div class="history-details">
                    <h4>Detail Item:</h4>
                    ${itemsHtml}
                    <div class="history-payment-info">
                        <div class="history-details-item"><strong>Total</strong><strong>${formatCurrency(tx.total)}</strong></div>
                        <div class="history-details-item"><span>Dibayar</span><span>${formatCurrency(tx.payment)}</span></div>
                        <div class="history-details-item"><span>Kembalian</span><span>${formatCurrency(tx.change)}</span></div>
                    </div>
                </div>
            `;
            historyListEl.appendChild(historyItem);
        });
    };

    const calculateDailyIncome = () => {
        const today = new Date().toDateString();
        const todayIncome = transactions
            .filter(tx => new Date(tx.date).toDateString() === today)
            .reduce((sum, tx) => sum + tx.total, 0);
        
        dailyIncomeEl.textContent = formatCurrency(todayIncome);
    };


    // --- ALUR PEMBAYARAN & CETAK STRUK ---
    const handleCheckout = () => {
        if (cart.length > 0) openPaymentModal();
    };

    const openPaymentModal = () => {
        modalTotalEl.textContent = formatCurrency(currentTotal);
        paymentInputEl.value = '';
        changeDisplayEl.textContent = formatCurrency(0);
        confirmPaymentBtn.disabled = true;
        paymentModalEl.style.display = 'flex';
        paymentInputEl.focus();
    };

    const confirmPayment = () => {
        const paymentAmount = parseFloat(paymentInputEl.value);
        if (isNaN(paymentAmount) || paymentAmount < currentTotal) return;
        const changeAmount = paymentAmount - currentTotal;

        const newTransaction = {
            id: `TRX-${Date.now()}`,
            date: new Date().toISOString(),
            items: [...cart], // Salin isi keranjang
            total: currentTotal,
            payment: paymentAmount,
            change: changeAmount
        };
        
        // Simpan transaksi
        transactions.push(newTransaction);
        saveTransactions();
        
        // Cetak struk
        printReceipt(newTransaction);
        
        // Reset
        closePaymentModal();
        cart = [];
        renderCart();
        renderHistory();
        calculateDailyIncome();
    };

        const printReceipt = (tx) => {
    const receiptItemsEl = document.getElementById('receipt-items');
    receiptItemsEl.innerHTML = '';

    tx.items.forEach(item => {
        const product = products.find(p => p.id === item.id);
        const itemTotal = product.price * item.quantity;
        const itemHtml = `
            <div class="receipt-item">
                <div class="receipt-item-name">${product.name}</div>
                <div class="receipt-item-details">
                    ${item.quantity} x ${formatCurrency(product.price)}      ${formatCurrency(itemTotal)}
                </div>
            </div>`;
        receiptItemsEl.innerHTML += itemHtml;
    });

    document.getElementById('receipt-date').textContent = new Date(tx.date).toLocaleString('id-ID');
    document.getElementById('receipt-id').textContent = tx.id;
    document.getElementById('receipt-total').textContent = formatCurrency(tx.total);
    document.getElementById('receipt-payment').textContent = formatCurrency(tx.payment);
    document.getElementById('receipt-change').textContent = formatCurrency(tx.change);
    
    // Beri jeda sesaat sebelum mencetak untuk memastikan DOM ter-update
    setTimeout(() => {
        window.print();
    }, 100); // Jeda 100 milidetik
};
    // --- EVENT LISTENERS ---
    navKasirBtn.onclick = () => {
        kasirSection.classList.add('active');
        riwayatSection.classList.remove('active');
        navKasirBtn.classList.add('active');
        navRiwayatBtn.classList.remove('active');
    };
    navRiwayatBtn.onclick = () => {
        riwayatSection.classList.add('active');
        kasirSection.classList.remove('active');
        navRiwayatBtn.classList.add('active');
        navKasirBtn.classList.remove('active');
    };
    
    categoryFiltersEl.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            categoryFiltersEl.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            currentFilter = e.target.dataset.category;
            renderProducts();
        }
    });

    searchInputEl.oninput = (e) => {
        currentSearchTerm = e.target.value;
        renderProducts();
    };

    checkoutButton.onclick = handleCheckout;
    closeModalBtn.onclick = () => paymentModalEl.style.display = 'none';
    confirmPaymentBtn.onclick = confirmPayment;

    paymentInputEl.oninput = () => {
        const paymentAmount = parseFloat(paymentInputEl.value) || 0;
        const change = paymentAmount - currentTotal;
        changeDisplayEl.textContent = formatCurrency(change);
        confirmPaymentBtn.disabled = change < 0;
        changeDisplayEl.style.color = change < 0 ? 'red' : 'green';
    };

    // --- INISIALISASI ---
    renderProducts();
    renderCart();
    renderHistory();
    calculateDailyIncome();
});