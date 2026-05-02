// 1. Buat fungsi Async (Karena mengambil data butuh waktu menunggu)
async function ambilDataBarang() {
    const tbody = document.getElementById('tabel-barang');
    try {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="px-6 py-8 text-center text-gray-400">
                    <div class="flex justify-center items-center space-x-2">
                        <svg class="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Memuat data...</span>
                    </div>
                </td>
            </tr>
        `;

        // 2. Panggil Pelayan (Fetch) menuju URL API
        // Gunakan URL folder yang sesuai di Laragon
        const response = await fetch('http://localhost/Pengki/api-toko/get_barang.php');

        // 3. Bongkar paket (Ubah string JSON jadi Object JS)
        const hasil = await response.json();

        if (hasil.status === 'success') {
            let barisHTML = '';

            const formatRupiah = (angka) => {
                return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
            };

            if (hasil.data.length === 0) {
                barisHTML = `
                    <tr>
                        <td colspan="4" class="px-6 py-8 text-center text-gray-500">Belum ada data barang.</td>
                    </tr>
                `;
            } else {
                // 4. Looping data barang
                hasil.data.forEach(barang => {
                    // Gunakan backtick (`) untuk memasukkan variabel ke HTML
                    barisHTML += `
                        <tr class="hover:bg-indigo-50/30 transition-colors duration-200 group">
                            <td class="px-6 py-4">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    #${barang.id.toString().padStart(4, '0')}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex items-center">
                                    <div class="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold shadow-sm border border-blue-200">
                                        ${barang.nama_barang.charAt(0).toUpperCase()}
                                    </div>
                                    <div class="ml-4">
                                        <div class="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">${barang.nama_barang}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <span class="text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-sm">
                                    ${formatRupiah(barang.harga)}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-center">
                                <button class="text-gray-400 hover:text-indigo-600 transition-colors p-2 rounded-lg hover:bg-indigo-50">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                </button>
                                <button class="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50 ml-1">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            </td>
                        </tr>
                    `;
                });
            }

            // 5. Tembakkan ke dalam id="tabel-barang" di index.html
            tbody.innerHTML = barisHTML;
        }
    } catch (error) {
        console.error('Gagal mengambil data:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="px-6 py-8 text-center text-red-500 bg-red-50">
                    <div class="flex flex-col items-center justify-center">
                        <svg class="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>Gagal memuat data dari server. Pastikan database dan server aktif.</span>
                    </div>
                </td>
            </tr>
        `;
    }
}

// 6. Jalankan fungsi saat file JS ini di-load
ambilDataBarang();

// Cek apakah browser mendukung Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('Service Worker Berhasil Didaftarkan!', registration.scope);
            })
            .catch(err => {
                console.error('Service Worker Gagal:', err);
            });
    });
}

// 1. Tangkap Elemen Form
const formTambah = document.getElementById('form-tambah');

// 2. Beri event 'submit' pada Form tersebut
formTambah.addEventListener('submit', async function(event) {
    
    // PENTING: Mencegah halaman berkedip/reload!
    event.preventDefault(); 
    
    // 3. Tangkap nilai yang diketik user
    const namaBarang = document.getElementById('input-nama').value;
    const hargaBarang = document.getElementById('input-harga').value;

    // 4. Siapkan kardus Data Object (akan di-stringify nanti)
    const dataKirim = {
        nama_barang: namaBarang,
        harga: hargaBarang
    };

    try {
        // 5. Panggil kurir Fetch API
        const response = await fetch('http://localhost/Pengki/api-toko/tambah_barang.php', {
            method: 'POST', // Beri tahu niatnya adalah menambah data
            headers: {
                'Content-Type': 'application/json' // Label bahwa isi paket adalah JSON
            },
            body: JSON.stringify(dataKirim) // Ubah Object JS menjadi String JSON
        });

        const hasil = await response.json();

        // 6. Cek status balasan dari PHP koki
        if (hasil.status === 'success') {
            // Bersihkan form inputan
            formTambah.reset(); 
            
            // Beri notifikasi ke user
            alert('Sukses: ' + hasil.pesan);
            
            // AJAIB: Panggil ulang fungsi Get Tabel dari Pertemuan 3!
            // Agar baris tabel otomatis bertambah tanpa reload halaman
            ambilDataBarang(); 
        } else {
            alert('Gagal: ' + hasil.pesan);
        }

    } catch (error) {
        console.error('Terjadi kesalahan koneksi:', error);
        alert('Gagal menghubungi server API. Pastikan XAMPP/Laragon menyala.');
    }
});