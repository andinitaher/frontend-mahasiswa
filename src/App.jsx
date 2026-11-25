
import { useEffect, useState } from "react";
import "./App.css";

const API_URL =
  `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/mahasiswa`;

const initialForm = {
  nim: "",
  nama: "",
  alamat: "",
  tgl_lahir: "",
  jurusan: ""
};

function App() {
  const [mahasiswa, setMahasiswa] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Mengambil data dari backend
  const fetchMahasiswa = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Gagal mengambil data mahasiswa.");
      }

      const data = await response.json();
      setMahasiswa(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Memanggil API saat halaman pertama dibuka
  useEffect(() => {
    fetchMahasiswa();
  }, []);

  // Mengatur perubahan input
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset form
  const resetForm = () => {
    setForm(initialForm);
    setEditId(null);
  };

  // Menambah dan mengedit mahasiswa
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    const method = editId ? "PUT" : "POST";

    const url = editId
      ? `${API_URL}/${editId}`
      : API_URL;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal menyimpan data."
        );
      }

      setSuccess(result.message);
      resetForm();

      await fetchMahasiswa();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Mengisi form ketika tombol edit diklik
  const handleEdit = (item) => {
    setEditId(item.id);

    setForm({
      nim: item.nim,
      nama: item.nama,
      alamat: item.alamat,
      tgl_lahir: item.tgl_lahir
        ? String(item.tgl_lahir).slice(0, 10)
        : "",
      jurusan: item.jurusan
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // Menghapus data mahasiswa
  const handleDelete = async (id) => {
    const yakin = window.confirm(
      "Apakah kamu yakin ingin menghapus data mahasiswa ini?"
    );

    if (!yakin) return;

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal menghapus data."
        );
      }

      setSuccess(result.message);

      if (editId === id) {
        resetForm();
      }

      await fetchMahasiswa();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Data Mahasiswa</h1>
        <p>
          Aplikasi Pengelolaan Data Mahasiswa
        </p>
      </header>

      <main>
        <section className="form-section">
          <h2>
            {editId
              ? "Edit Data Mahasiswa"
              : "Tambah Mahasiswa"}
          </h2>

          {error && (
            <div className="alert error">
              {error}
            </div>
          )}

          {success && (
            <div className="alert success">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>NIM</label>
              <input
                type="text"
                name="nim"
                value={form.nim}
                onChange={handleChange}
                maxLength="20"
                required
                placeholder="Masukkan NIM"
              />
            </div>

            <div className="form-group">
              <label>Nama Mahasiswa</label>
              <input
                type="text"
                name="nama"
                value={form.nama}
                onChange={handleChange}
                maxLength="100"
                required
                placeholder="Masukkan nama"
              />
            </div>

            <div className="form-group">
              <label>Alamat</label>
              <textarea
                name="alamat"
                value={form.alamat}
                onChange={handleChange}
                required
                placeholder="Masukkan alamat"
              />
            </div>

            <div className="form-group">
              <label>Tanggal Lahir</label>
              <input
                type="date"
                name="tgl_lahir"
                value={form.tgl_lahir}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Jurusan</label>
              <input
                type="text"
                name="jurusan"
                value={form.jurusan}
                onChange={handleChange}
                maxLength="100"
                required
                placeholder="Masukkan jurusan"
              />
            </div>

            <div className="button-group">
              <button
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Menyimpan..."
                  : editId
                    ? "Update Data"
                    : "Tambah Mahasiswa"}
              </button>

              {editId && (
                <button
                  type="button"
                  className="cancel-button"
                  onClick={resetForm}
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="table-section">
          <h2>Daftar Mahasiswa</h2>

          {loading ? (
            <p>Memuat data mahasiswa...</p>
          ) : mahasiswa.length === 0 ? (
            <p>Belum ada data mahasiswa.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>NIM</th>
                    <th>Nama</th>
                    <th>Alamat</th>
                    <th>Tanggal Lahir</th>
                    <th>Jurusan</th>
                    <th>Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {mahasiswa.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>{item.nim}</td>
                      <td>{item.nama}</td>
                      <td>{item.alamat}</td>
                      <td>
                        {String(item.tgl_lahir).slice(0, 10)}
                      </td>
                      <td>{item.jurusan}</td>

                      <td>
                        <div className="action-buttons">
                          <button
                            className="edit-button"
                            onClick={() => handleEdit(item)}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() => handleDelete(item.id)}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <footer>
        <p>© 2026 Aplikasi Data Mahasiswa</p>
      </footer>
    </div>
  );
}

export default App;
