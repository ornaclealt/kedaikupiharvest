<script>
    // DATA SIMULASI (akan datang dari Backend di implementasi nyata)
    const products = [
        { id: 1, name: "Kopi Susu Harvest", desc: "Signature kopi susu gula aren.", price: 20000, category: "Kopi Dingin" },
        { id: 2, name: "V60 Manual Brew", desc: "Arabika pilihan, fruity & floral.", price: 25000, category: "Kopi Panas" },
        { id: 3, name: "Roti Bakar Kaya", desc: "Camilan klasik pendamping kopi.", price: 15000, category: "Makanan Ringan" },
        { id: 4, name: "Mojito Squash", desc: "Kesegaran soda dan mint.", price: 18000, category: "Non-Kopi" },
        // ... Tambahkan produk lain
    ];

    let cart = [];

    // --- FUNGSI UTAMA ---

    function renderCatalog() {
        const catalogEl = document.getElementById('product-catalog');
        let html = '';
        products.forEach(product => {
            html += `
                <div class="menu-card" data-id="${product.id}">
                    <i class="fas fa-coffee menu-icon"></i>
                    <h3>${product.name}</h3>
                    <p>${product.desc}</p>
                    <span class="price">Rp ${product.price.toLocaleString('id-ID')}</span>
                    <button onclick="addToCart(${product.id})" class="btn-cta" style="margin-top: 10px;">
                        <i class="fas fa-cart-plus"></i> Tambah
                    </button>
                </div>
            `;
        });
        catalogEl.innerHTML = html;
        // Tambahkan tombol Keranjang di bagian atas katalog
        const cartButton = document.getElementById('cart-button');
        if (cartButton) {
            catalogEl.prepend(cartButton);
        }
    }

    function updateCartCount() {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        document.getElementById('cart-count').innerText = count;
    }

    function addToCart(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCartCount();
        alert(`${product.name} ditambahkan ke Keranjang!`);
    }

    function openCheckoutModal() {
        const modal = document.getElementById('checkout-modal');
        const content = modal.querySelector('.modal-content') || document.createElement('div');
        content.className = 'modal-content';

        if (cart.length === 0) {
            content.innerHTML = `
                <span class="close-btn" onclick="closeModal('checkout-modal')">&times;</span>
                <h2>Keranjang Kosong 😔</h2>
                <p>Silakan tambahkan menu ke keranjang Anda terlebih dahulu.</p>
            `;
        } else {
            const itemsList = cart.map(item => `
                <li>${item.name} x ${item.quantity} = Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</li>
            `).join('');
            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            content.innerHTML = `
                <span class="close-btn" onclick="closeModal('checkout-modal')">&times;</span>
                <h2>🛒 Konfirmasi Pesanan</h2>
                <h3>Detail Pesanan:</h3>
                <ul>${itemsList}</ul>
                <p><strong>Subtotal: Rp ${subtotal.toLocaleString('id-ID')}</strong></p>
                <hr style="margin: 1rem 0;">

                <form class="checkout-form" id="place-order-form">
                    <label for="customerName">Atas Nama:</label>
                    <input type="text" id="customerName" required>

                    <label for="tableNumber">Nomor Meja:</label>
                    <input type="text" id="tableNumber" required>

                    <label for="promoCode">Kode Promo (Opsional):</label>
                    <input type="text" id="promoCode" placeholder="Masukkan kode promo">
                    <button type="button" onclick="applyPromo()">Klaim Promo</button>
                    <p id="promo-message" style="color: green; font-size: 0.9em;"></p>

                    <label for="paymentMethod">Metode Pembayaran:</label>
                    <select id="paymentMethod" required>
                        <option value="">Pilih Metode</option>
                        <option value="Tunai">Tunai (Bayar di Kasir)</option>
                        <option value="Transfer">Transfer Bank (Virtual Account)</option>
                        <option value="E-Wallet">E-Wallet (QRIS)</option>
                    </select>
                    
                    <button type="submit" class="btn-checkout">Pesan Sekarang & Bayar</button>
                </form>
            `;
            modal.appendChild(content);

            // Menambahkan event listener untuk submit form
            const form = document.getElementById('place-order-form');
            form.onsubmit = function(e) {
                e.preventDefault();
                placeOrder(subtotal);
            };
        }
        modal.style.display = "block";
    }

    function closeModal(modalId) {
        document.getElementById(modalId).style.display = "none";
    }
    
    // --- FUNGSI SIMULASI BACKEND ---

    // Simulasikan Pemesanan
    function placeOrder(total) {
        const name = document.getElementById('customerName').value;
        const table = document.getElementById('tableNumber').value;
        const payment = document.getElementById('paymentMethod').value;
        const promoCode = document.getElementById('promoCode').value;

        const orderData = {
            id: Date.now(), // ID Pesanan unik
            customer: name,
            table: table,
            items: JSON.parse(JSON.stringify(cart)), // deep copy
            total: total,
            payment: payment,
            promo: promoCode || '-',
            status: payment === 'Tunai' ? 'processing' : 'pending', // Jika tunai, langsung proses
            timestamp: new Date().toLocaleTimeString('id-ID'),
        };

        // *************** DI SINI BACKEND AKAN MENERIMA DATA ORDER ***************
        // orderData AKAN DIKIRIM KE API BACKEND UNTUK DISIMPAN KE DATABASE
        // DAN BARU DITAMPILKAN KE RIWAYAT

        // SIMULASI: Tambahkan ke riwayat lokal (Ganti ini dengan fetch API)
        const currentOrders = JSON.parse(localStorage.getItem('orderHistory')) || [];
        currentOrders.push(orderData);
        localStorage.setItem('orderHistory', JSON.stringify(currentOrders));

        cart = []; // Kosongkan keranjang
        updateCartCount();
        closeModal('checkout-modal');
        
        // Alihkan ke halaman/tampilan Selesai Checkout
        displayOrderSuccess(orderData);
    }
    
    function displayOrderSuccess(order) {
        alert(`Pesanan Berhasil! ID: ${order.id}\nTotal: Rp ${order.total.toLocaleString('id-ID')}\nStatus: ${order.status === 'pending' ? 'Menunggu Pembayaran' : 'Diproses'}`);
        // Anda bisa membuat modal terpisah untuk tampilan 'Selesai Checkout' yang lebih bagus.
        window.location.hash = '#history'; // Arahkan ke Riwayat setelah pesan
        renderHistory(); // Render ulang riwayat
    }
    
    function applyPromo() {
        const code = document.getElementById('promoCode').value.toUpperCase();
        const promoMsg = document.getElementById('promo-message');
        
        // SIMULASI PROMO
        if (code === 'HARVEST10') {
            promoMsg.innerText = "Promo 'HARVEST10' berhasil diterapkan! (Implementasi diskon memerlukan backend)";
        } else {
            promoMsg.innerText = "Kode promo tidak valid atau tidak tersedia.";
        }
    }

    // --- RIWAYAT PESANAN ---

    function renderHistory(filterStatus = 'pending') {
        const historyListEl = document.getElementById('order-history-list');
        const allOrders = JSON.parse(localStorage.getItem('orderHistory')) || [];
        const filteredOrders = allOrders.filter(order => order.status === filterStatus);
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-status') === filterStatus) {
                btn.classList.add('active');
            }
        });

        if (filteredOrders.length === 0) {
            historyListEl.innerHTML = `<p style="text-align: center; margin-top: 2rem;">Tidak ada pesanan dengan status "${filterStatus}".</p>`;
            return;
        }

        let html = '';
        filteredOrders.forEach(order => {
            const itemsSummary = order.items.map(i => `${i.name} (${i.quantity})`).join(', ');
            let actionButton = '';
            
            if (order.status === 'pending') {
                actionButton = `<button class="btn-checkout" style="background: #F0AD4E;" onclick="simulatePayment(${order.id})">Bayar Sekarang</button>`;
            } else if (order.status === 'processing') {
                actionButton = `<button class="btn-checkout" style="background: #5BC0DE; cursor: default;">Pesanan Sedang Disiapkan...</button>`;
            } else if (order.status === 'completed') {
                if (!order.rating) {
                    actionButton = `
                        <p>Bagaimana pengalaman Anda? Beri rating dan masukan!</p>
                        <form class="rating-form" onsubmit="submitRating(event, ${order.id})">
                            <input type="number" id="rating-${order.id}" min="1" max="5" placeholder="Rating (1-5)" required>
                            <textarea id="comment-${order.id}" placeholder="Kritik, Masukan, atau Apresiasi"></textarea>
                            <button type="submit" class="btn-checkout" style="background: var(--accent);">Kirim Penilaian</button>
                        </form>
                    `;
                } else {
                    actionButton = `<p style="color: green; font-weight: bold;">Terima kasih atas Penilaian Anda (${order.rating}/5)!</p>`;
                }
            }
            
            html += `
                <div class="order-card">
                    <h4>Pesanan #${order.id} | Status: ${filterStatus.toUpperCase()}</h4>
                    <p><strong>Meja:</strong> ${order.table} | <strong>Total:</strong> Rp ${order.total.toLocaleString('id-ID')}</p>
                    <p><strong>Menu:</strong> ${itemsSummary}</p>
                    <div style="margin-top: 10px;">${actionButton}</div>
                </div>
            `;
        });
        historyListEl.innerHTML = html;
    }
    
    function simulatePayment(orderId) {
        // SIMULASI BACKEND: Update status pesanan
        const allOrders = JSON.parse(localStorage.getItem('orderHistory')) || [];
        const orderIndex = allOrders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            allOrders[orderIndex].status = 'processing';
            localStorage.setItem('orderHistory', JSON.stringify(allOrders));
            alert(`Pembayaran pesanan #${orderId} berhasil disimulasikan! Status diubah menjadi 'Diproses'.`);
            renderHistory('processing');
        }
    }
    
    function submitRating(e, orderId) {
        e.preventDefault();
        const rating = document.getElementById(`rating-${orderId}`).value;
        const comment = document.getElementById(`comment-${orderId}`).value;

        // SIMULASI BACKEND: Kirim rating dan komentar
        const allOrders = JSON.parse(localStorage.getItem('orderHistory')) || [];
        const orderIndex = allOrders.findIndex(o => o.id === orderId);
        
        if (orderIndex !== -1) {
            allOrders[orderIndex].rating = rating;
            allOrders[orderIndex].comment = comment;
            localStorage.setItem('orderHistory', JSON.stringify(allOrders));
            
            // Logika Filtrasi Kritik/Apresiasi (diimplementasikan di Backend):
            // - Backend akan menganalisis teks komentar (NLP sederhana)
            // - Contoh: jika mengandung kata "sangat enak", "cepat", "suka" -> Apresiasi
            // - Contoh: jika mengandung kata "lama", "kurang", "dingin" -> Kritik/Masukan
            // - Hasil filtrasi ini akan masuk ke database khusus "Sosial Media" (feed)
            
            alert(`Penilaian (${rating}/5) berhasil dikirim! Komentar akan diproses untuk Feed Sosmed Harvest.`);
            renderHistory('completed');
        }
    }

    // Event listeners saat DOM siap
    document.addEventListener('DOMContentLoaded', () => {
        renderCatalog();
        updateCartCount();
        renderHistory(); // Tampilkan default 'pending'
        
        // Listener untuk tombol keranjang di Navigasi
        document.getElementById('cart-button').addEventListener('click', (e) => {
            e.preventDefault();
            openCheckoutModal();
        });
        
        // Listener untuk tab riwayat
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                renderHistory(this.getAttribute('data-status'));
            });
        });
    });
</script>
