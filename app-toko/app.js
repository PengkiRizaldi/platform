async function ambilDataBarang() {
    try {
        // 2. Panggil Pelayan (Fetch) menuju URL API
        const response = await fetch('https://pengkirizaldi-webapp1.infinityfreeapp.com/api-toko/get_barang.php');
        
        // CEK STATUS RESPONSE
        if (!response.ok) {
            const responseText = await response.text();
            console.error('Server Error:', response.status, responseText);
            console.error('Koneksi database mungkin gagal. Cek koneksi.php di server production.');
            return;
        }

        // 3. Bongkar paket (Ubah string JSON jadi Object JS)
        const hasil = await response.json();
        
        if (hasil.status === 'success') {
            let barisHTML = '';
            
            // 4. Looping data barang
            hasil.data.forEach(barang => {
                barisHTML += `
                    <tr class="border-b text-center p-2 hover:bg-gray-50">
                        <td class="py-2">${barang.id}</td>
                        <td class="py-2">${barang.nama_barang}</td>
                        <td class="py-2">Rp ${barang.harga}</td>
                        <td class="py-3">
                            <div class="flex gap-2 justify-center">
                                <button onclick="editBarang(${barang.id}, '${barang.nama_barang.replace(/'/g, "\\'")}', ${barang.harga})"
                                    title="Edit barang ini"
                                    class="inline-flex items-center gap-1.5 bg-sky-50 hover:bg-sky-500 text-sky-600 hover:text-white border border-sky-300 hover:border-sky-500 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-px active:scale-95">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                    Edit
                                </button>
                                <button onclick="hapusBarang(${barang.id})"
                                    title="Hapus barang ini"
                                    class="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-300 hover:border-rose-500 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-px active:scale-95">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <polyline points="3 6 5 6 21 6"/>
                                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                        <path d="M10 11v6M14 11v6"/>
                                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                    </svg>
                                    Hapus
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
});
            
            // 5. Tembakkan ke dalam id="tabel-barang" di index.html
            document.getElementById('tabel-barang').innerHTML = barisHTML;
        }
    } catch (error) {
        console.error('Gagal mengambil data:', error);
    }
}

// 1. Tangkap Elemen Form
const formTambah = document.getElementById('form-tambah');

// 2. Beri event 'submit' pada Form tersebut
formTambah.addEventListener('submit', async function(event) {
    
    // PENTING: Mencegah halaman berkedip/reload!
    event.preventDefault(); 
    
    // 3. Tangkap nilai yang diketik user
    const idBarang   = document.getElementById('input-id').value;   // Kosong = mode Tambah
    const namaBarang = document.getElementById('input-nama').value;
    const hargaBarang = document.getElementById('input-harga').value;

    // 4. Cek apakah sedang dalam mode EDIT atau TAMBAH
    const isEditMode = idBarang !== '';

    const dataKirim = {
        nama_barang: namaBarang,
        harga: hargaBarang
    };
    if (isEditMode) {
        dataKirim.id = idBarang; // Tambahkan ID hanya saat Edit
    }

    // 5. Tentukan URL & Method sesuai mode
    const url    = isEditMode
        ? 'https://pengkirizaldi-webapp1.infinityfreeapp.com/api-toko/edit_barang.php'
        : 'https://pengkirizaldi-webapp1.infinityfreeapp.com/api-toko/tambah_barang.php';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': myToken  // Kirim token sebagai tiket akses
            },
            body: JSON.stringify(dataKirim)
        });

        // CEK STATUS RESPONSE DARI SERVER
        if (!response.ok) {
            const responseText = await response.text();
            console.error('Server Error:', response.status, responseText);
            alert(`Error ${response.status}: Cek browser console untuk detail error.\nPastikan koneksi database di server bekerja.`);
            return;
        }

        const hasil = await response.json();

        if (hasil.status === 'success') {
            // Kembalikan form ke mode Tambah
            batalEdit();
            
            // Beri notifikasi ke user
            alert('Sukses: ' + hasil.pesan);
            
            // Refresh tabel
            ambilDataBarang(); 
        } else {
            alert('Gagal: ' + hasil.pesan);
        }

    } catch (error) {
        console.error('Terjadi kesalahan koneksi:', error);
        alert('Gagal: ' + error.message + '\n\nPastikan:\n1. XAMPP/Laragon menyala\n2. Koneksi database bekerja\n3. Check browser console untuk detail error');
    }
});

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


// Fungsi Hapus Data
async function hapusBarang(id_target) {
    
    // 1. Validasi Keamanan / Konfirmasi
    // Mencegah penghapusan karena klik tidak sengaja
    const yakin = confirm("Peringatan!\nApakah Anda yakin ingin menghapus barang dengan ID " + id_target + "?");
    
    // Jika user mengklik "OK" / "Yes" pada popup
    if (yakin) {
        try {
            // 2. Fetch API Koki
            const response = await fetch('https://pengkirizaldi-webapp1.infinityfreeapp.com/api-toko/hapus_barang.php', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': myToken  // Kirim token sebagai tiket akses
                },
                body: JSON.stringify({ id: id_target })
            });

            // CEK STATUS RESPONSE
            if (!response.ok) {
                const responseText = await response.text();
                console.error('Server Error:', response.status, responseText);
                alert(`Error ${response.status}: Cek browser console untuk detail error.`);
                return;
            }

            const hasil = await response.json();

            // 3. Respon UI (Refresh Tabel)
            if (hasil.status === 'success') {
                // Panggil ulang ambilDataBarang agar tabel ter-update (hilang satu baris) secara otomatis
                ambilDataBarang(); 
            } else {
                alert('Gagal: ' + hasil.pesan);
            }

        } catch (error) {
            console.error('Terjadi kesalahan:', error);
            alert('Gagal: ' + error.message);
        }
    }
}


// =========================================
// Fungsi Edit Data
// =========================================

/**
 * Mengisi form dengan data dari baris tabel yang diklik tombol Edit-nya.
 * @param {number} id - ID barang
 * @param {string} nama - Nama barang
 * @param {number} harga - Harga barang
 */
function editBarang(id, nama, harga) {
    // 1. Isi hidden input ID (penanda mode Edit)
    document.getElementById('input-id').value = id;

    // 2. Isi field form dengan data dari tabel
    document.getElementById('input-nama').value  = nama;
    document.getElementById('input-harga').value = harga;

    // 3. Ubah tampilan judul form
    const judulForm = document.getElementById('judul-form');
    judulForm.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-sky-500">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        Edit Barang <span class="ml-1 text-sm font-normal text-sky-600">(ID: ${id})</span>
    `;

    // 4. Ubah tombol Submit menjadi biru + ikon Update (mode Edit)
    const btnSubmit = document.getElementById('btn-submit');
    btnSubmit.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
        </svg>
        Update
    `;
    btnSubmit.className = 'inline-flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-bold py-2 px-6 rounded-lg transition-all duration-200 hover:shadow-lg h-[42px]';

    // 5. Tampilkan tombol Batal
    document.getElementById('btn-batal').classList.remove('hidden');

    // 6. Scroll halus ke atas menuju form
    document.getElementById('form-tambah').scrollIntoView({ behavior: 'smooth', block: 'center' });

    // 7. Fokus ke field Nama Barang
    document.getElementById('input-nama').focus();
}

/**
 * Mengembalikan form ke mode Tambah (membatalkan mode Edit).
 */
function batalEdit() {
    // Reset hidden ID
    document.getElementById('input-id').value = '';

    // Kosongkan field form
    document.getElementById('form-tambah').reset();

    // Kembalikan judul form
    document.getElementById('judul-form').innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-amber-500">
            <path d="M5 12h14"/><path d="M12 5v14"/>
        </svg>
        Tambah Barang Baru
    `;

    // Kembalikan tombol Submit ke warna amber (mode Tambah)
    const btnSubmit = document.getElementById('btn-submit');
    btnSubmit.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
        </svg>
        Simpan
    `;
    btnSubmit.className = 'inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold py-2 px-6 rounded-lg transition-all duration-200 hover:shadow-lg h-[42px]';

    // Sembunyikan tombol Batal
    document.getElementById('btn-batal').classList.add('hidden');
}

// =========================================
// Autentikasi & Token
// =========================================

// Ambil token yang tersimpan di browser (hasil login)
const myToken = localStorage.getItem('token_toko');

// Guard: jika tidak ada token, paksa arahkan ke halaman login
if (!myToken) {
    alert('Anda harus login terlebih dahulu!');
    window.location.href = 'login.html';
}

/**
 * Fungsi Logout — hapus token dan kembali ke halaman login.
 * Panggil fungsi ini dari tombol Logout di index.html:
 * <button onclick="logout()">Logout</button>
 */
function logout() {
    localStorage.removeItem('token_toko');
    window.location.href = 'login.html';
}
