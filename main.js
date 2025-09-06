let daftarBarang = [];
let totalHarga = 0;
let indexEdit = -1;

function sanitize(input) {
  let div = document.createElement('div');
  div.innerText = input;
  return div.innerHTML;
}

function tampilkanBarang() {
  let output = document.getElementById('output');
  output.innerHTML = '';

  daftarBarang.forEach((item, index) => {
    output.innerHTML += `
      <tr>
        <td>
          <img src="${item.gambar}" width="40" height="40" style="vertical-align:middle; margin-right:8px;">
          ${item.nama}
        </td>
        <td>Rp${item.harga}</td>
        <td>${item.jumlah}</td>
        <td>Rp${item.harga * item.jumlah}</td>
        <td>
          <button onclick="editBarang(${index})">Edit</button>
          <button onclick="hapusBarang(${index})">Hapus</button>
        </td>
      </tr>
    `;
  });

  hitungTotal();
  document.getElementById('jumlahJenisBarang').textContent = daftarBarang.length;
}

function tambahBarang() {
  let namaBarang = sanitize(document.getElementById('namaBarang').value.trim());
  let harga = parseInt(document.getElementById('harga').value);
  let jumlah = parseInt(document.getElementById('jumlah').value);
  let gambar = document.getElementById('gambar').files[0];
  let gambarURL;

  if (!namaBarang) {
    alert('Nama barang tidak boleh kosong');
    return;
  }
  if (isNaN(harga) || harga <= 0) {
    alert('Harga harus lebih besar dari 0');
    return;
  }
  if (isNaN(jumlah) || jumlah <= 0) {
    alert('Jumlah harus lebih besar dari 0');
    return;
  }
  
  if (indexEdit === -1) {
    if (!gambar) {
      alert('Gambar barang harus diunggah');
      return;
    }
    let ekstensiGambar = gambar.name.split('.').pop().toLowerCase();
    if (!['jpg', 'jpeg', 'png'].includes(ekstensiGambar)) {
      alert('Hanya file gambar (.jpg, .jpeg, .png) yang diperbolehkan.');
      return;
    }
    gambarURL = URL.createObjectURL(gambar);
  } else {
    if (gambar) {
      let ekstensiGambar = gambar.name.split('.').pop().toLowerCase();
      if (!['jpg', 'jpeg', 'png'].includes(ekstensiGambar)) {
        alert('Hanya file gambar (.jpg, .jpeg, .png) yang diperbolehkan.');
        return;
      }
      gambarURL = URL.createObjectURL(gambar);
    } else {
      gambarURL = daftarBarang[indexEdit].gambar;
    }
  }

  if (indexEdit === -1) {
    daftarBarang.push({ nama: namaBarang, harga: harga, jumlah: jumlah, gambar: gambarURL });
  } else {
    daftarBarang[indexEdit].nama = namaBarang;
    daftarBarang[indexEdit].harga = harga;
    daftarBarang[indexEdit].jumlah = jumlah;
    daftarBarang[indexEdit].gambar = gambarURL;

    indexEdit = -1;
    document.getElementById('btnTambah').innerText = "Masukkan";
  }
  
  document.getElementById('namaBarang').value = '';
  document.getElementById('harga').value = '';
  document.getElementById('jumlah').value = '';
  document.getElementById('gambar').value = '';

  tampilkanBarang();
}

function editBarang(index) {
  let barang = daftarBarang[index];

  document.getElementById('namaBarang').value = barang.nama;
  document.getElementById('harga').value = barang.harga;
  document.getElementById('jumlah').value = barang.jumlah;

  indexEdit = index;
  document.getElementById('btnTambah').innerText = "Update";
}

function hapusBarang(index) {
  if (confirm('Ingin menghapus barang ini?')) {
    daftarBarang.splice(index, 1);
    tampilkanBarang();
  }
}

function hitungTotal() {
  totalHarga = daftarBarang.reduce((sum, item) => sum + (item.harga * item.jumlah), 0);
  let ppn = totalHarga * 0.12;
  let totalAkhir = totalHarga + ppn;

  document.getElementById('total').innerHTML = `
    Sub Total : Rp${totalHarga} <br>
    PPN (12%) : Rp${ppn} <br>
    <strong>Total : Rp${totalAkhir}</strong>
  `;
  
  let jumlahJenisBarang = daftarBarang.length;
  document.getElementById('jumlahJenisBarang').textContent = jumlahJenisBarang;
  
  let jumlahTotalBarang = daftarBarang.reduce((sum, item) => sum + item.jumlah, 0);
  document.getElementById('jumlahTotalBarang').textContent = jumlahTotalBarang;
}

function resetData() {
  if (confirm('Apakah Anda yakin ingin menghapus semua data barang?')) {
    daftarBarang = [];
    tampilkanBarang();
  }
}
