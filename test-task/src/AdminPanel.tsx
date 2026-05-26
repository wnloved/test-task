import { useState, useEffect } from 'react';
import './AdminPanel.css';

interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  year: number;
  hp: number;
  image: string;
  inStock: boolean;
  description: string;
  specs?: any;
}

interface ContactRequest {
  id: number;
  name: string;
  phone: string;
  message: string | null;
  type: string;
  status: string;
  createdAt: string;
}

const API = 'http://localhost:3000';
const TOKEN = 'admin-token-agrotech-2025';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${TOKEN}`,
};

// Компонент логина
function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
      });

      if (res.ok) {
        localStorage.setItem('admin_token', TOKEN);
        onLogin();
      } else {
        setError('Неверный логин или пароль');
      }
    } catch {
      setError('Ошибка сервера');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="login-card">
        <h1>🔐 AgroTech Admin</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Логин</label>
            <input type="text" value={login} onChange={e => setLogin(e.target.value)} placeholder="admin" required />
          </div>
          <div className="form-group">
            <label>Пароль</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? '⏳ Вход...' : 'Войти'}
          </button>
        </form>
        <p className="login-hint">Логин: admin / Пароль: agrotech2025</p>
      </div>
    </div>
  );
}

// Вкладки админки
function ContactsTab() {
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = async () => {
    try {
      const res = await fetch(`${API}/products/admin/contacts`, { headers });
      const data = await res.json();
      setContacts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContacts(); }, []);

  const updateStatus = async (id: number, status: string) => {
    await fetch(`${API}/products/admin/contacts/${id}/status`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status }),
    });
    fetchContacts();
  };

  const deleteContact = async (id: number) => {
    if (!confirm('Удалить заявку?')) return;
    await fetch(`${API}/products/admin/contacts/${id}`, { method: 'DELETE', headers });
    fetchContacts();
  };

  const getStatusBadge = (status: string) => {
    const map: any = {
      new: { text: 'Новая', class: 'badge-new' },
      processed: { text: 'Обработана', class: 'badge-processed' },
      completed: { text: 'Завершена', class: 'badge-completed' },
    };
    const s = map[status] || map.new;
    return <span className={`status-badge ${s.class}`}>{s.text}</span>;
  };

  if (loading) return <div className="loading">⏳ Загрузка...</div>;

  return (
    <div className="contacts-tab">
      <h2>📋 Заявки ({contacts.length})</h2>
      <div className="contacts-grid">
        {contacts.map(c => (
          <div key={c.id} className="contact-card">
            <div className="contact-header">
              <span className="contact-type">{c.type === 'call' ? '📞 Звонок' : '💬 Вопрос'}</span>
              {getStatusBadge(c.status)}
            </div>
            <div className="contact-body">
              <p><strong>Имя:</strong> {c.name}</p>
              <p><strong>Телефон:</strong> {c.phone}</p>
              {c.message && <p><strong>Сообщение:</strong> {c.message}</p>}
              <p className="contact-date">{new Date(c.createdAt).toLocaleString('ru')}</p>
            </div>
            <div className="contact-actions">
              <select value={c.status} onChange={e => updateStatus(c.id, e.target.value)}>
                <option value="new">Новая</option>
                <option value="processed">Обработана</option>
                <option value="completed">Завершена</option>
              </select>
              <button onClick={() => deleteContact(c.id)} className="btn-delete">🗑️</button>
            </div>
          </div>
        ))}
        {contacts.length === 0 && <p className="empty">Нет заявок</p>}
      </div>
    </div>
  );
}

function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const emptyProduct: Product = {
    id: 0, name: '', category: 'Тракторы', price: '₽0', year: 2024, hp: 100,
    image: 'primer.jpg', inStock: true, description: '', specs: []
  };

  const [form, setForm] = useState<Product>(emptyProduct);
  const [specsInput, setSpecsInput] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const openCreate = () => {
    setForm(emptyProduct);
    setSpecsInput('');
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (product: Product) => {
    setForm(product);
    setSpecsInput(JSON.stringify(product.specs, null, 2));
    setEditing(product);
    setShowForm(true);
  };

  const handleSave = async () => {
    let specs = null;
    try {
      specs = specsInput ? JSON.parse(specsInput) : null;
    } catch {
      alert('Ошибка в JSON характеристик');
      return;
    }

    const body = { ...form, specs };

    if (editing) {
      await fetch(`${API}/products/admin/product/${editing.id}`, {
        method: 'PUT', headers, body: JSON.stringify(body),
      });
    } else {
      await fetch(`${API}/products/admin/product`, {
        method: 'POST', headers, body: JSON.stringify(body),
      });
    }
    setShowForm(false);
    fetchProducts();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить товар?')) return;
    await fetch(`${API}/products/admin/product/${id}`, { method: 'DELETE', headers });
    fetchProducts();
  };

  if (loading) return <div className="loading">⏳ Загрузка...</div>;

  return (
    <div className="products-tab">
      <div className="tab-header">
        <h2>🚜 Товары ({products.length})</h2>
        <button onClick={openCreate} className="btn-add">+ Добавить товар</button>
      </div>

      {showForm && (
        <div className="modal-overlay-admin" onClick={() => setShowForm(false)}>
          <div className="modal-content-admin" onClick={e => e.stopPropagation()}>
            <h2>{editing ? '✏️ Редактировать' : '➕ Новый товар'}</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>Название *</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Категория *</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  <option>Тракторы</option><option>Комбайны</option><option>Почвообработка</option>
                  <option>Посев</option><option>Защита растений</option><option>Косилки</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Цена *</label>
                <input type="text" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="₽12,500,000" />
              </div>
              <div className="form-group">
                <label>Год *</label>
                <input type="number" value={form.year} onChange={e => setForm({...form, year: parseInt(e.target.value)})} />
              </div>
              <div className="form-group">
                <label>Л.С. *</label>
                <input type="number" value={form.hp} onChange={e => setForm({...form, hp: parseInt(e.target.value)})} />
              </div>
            </div>

            <div className="form-group">
              <label>Изображение (имя файла из uploads/)</label>
              <input type="text" value={form.image} onChange={e => setForm({...form, image: e.target.value})} placeholder="tractor.jpg" />
            </div>

            <div className="form-group">
              <label>Описание</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} />
            </div>

            <div className="form-group">
              <label>Характеристики (JSON)</label>
              <textarea value={specsInput} onChange={e => setSpecsInput(e.target.value)} 
                rows={5} placeholder='[{"label":"Двигатель","value":"V8 Turbo"},{"label":"Вес","value":"5000 кг"}]' />
            </div>

            <div className="form-group checkbox">
              <label>
                <input type="checkbox" checked={form.inStock} onChange={e => setForm({...form, inStock: e.target.checked})} />
                В наличии
              </label>
            </div>

            <div className="form-actions">
              <button onClick={() => setShowForm(false)} className="btn-cancel">Отмена</button>
              <button onClick={handleSave} className="btn-save">{editing ? '💾 Сохранить' : '➕ Создать'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="products-table-wrapper">
        <table className="products-table">
          <thead>
            <tr>
              <th>ID</th><th>Фото</th><th>Название</th><th>Категория</th>
              <th>Цена</th><th>Год</th><th>В наличии</th><th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td><img src={`${API}/products/image/${p.image}`} alt="" className="table-img" /></td>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>{p.price}</td>
                <td>{p.year}</td>
                <td>{p.inStock ? '✅' : '❌'}</td>
                <td className="actions-cell">
                  <button onClick={() => openEdit(p)} className="btn-edit">✏️</button>
                  <button onClick={() => handleDelete(p.id)} className="btn-delete">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Главный компонент админки
export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
const [tab, setTab] = useState<'contacts' | 'products' | 'files'>('contacts');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token === TOKEN) setIsLoggedIn(true);
  }, []);

  const handleLogin = () => setIsLoggedIn(true);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) return <LoginForm onLogin={handleLogin} />;

  return (
<div className="admin-panel">
      <header className="admin-header">
        <h1>🔐 AgroTech Admin</h1>
        <nav>
          <button className={tab === 'contacts' ? 'active' : ''} onClick={() => setTab('contacts')}>📋 Заявки</button>
          <button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>🚜 Товары</button>
          <button className={tab === 'files' ? 'active' : ''} onClick={() => setTab('files')}>📁 Файлы</button>
        </nav>
        <button onClick={handleLogout} className="btn-logout">🚪 Выйти</button>
      </header>
      <main className="admin-main">
        {tab === 'contacts' && <ContactsTab />}
        {tab === 'products' && <ProductsTab />}
        {tab === 'files' && <FilesTab />}
      </main>
    </div>
  );
}
function FilesTab() {
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const fetchFiles = async () => {
    try {
      const res = await fetch(`${API}/products/admin/files`, { headers });
      const data = await res.json();
      setFiles(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFiles(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      await fetch(`${API}/products/admin/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${TOKEN}` },
        body: formData,
      });
      fetchFiles();
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
      e.target.value = ''; // Сбрасываем input
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm('Удалить файл?')) return;
    await fetch(`${API}/products/admin/files/${filename}`, {
      method: 'DELETE',
      headers,
    });
    fetchFiles();
  };

  const startRename = (filename: string) => {
    setRenamingFile(filename);
    setNewName(filename);
  };

  const cancelRename = () => {
    setRenamingFile(null);
    setNewName('');
  };

  const handleRename = async () => {
    if (!renamingFile || !newName) return;
    
    if (newName === renamingFile) {
      cancelRename();
      return;
    }

    try {
      const res = await fetch(`${API}/products/admin/files/${renamingFile}/rename`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ newName }),
      });

      if (res.ok) {
        setRenamingFile(null);
        setNewName('');
        fetchFiles();
      } else {
        const error = await res.json();
        alert(error.message || 'Ошибка при переименовании');
      }
    } catch (e) {
      console.error(e);
      alert('Ошибка сервера');
    }
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      cancelRename();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Мини-уведомление вместо alert
    const btn = document.activeElement as HTMLElement;
    if (btn) {
      const originalText = btn.textContent;
      btn.textContent = '✅';
      setTimeout(() => { btn.textContent = originalText; }, 1000);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('ru', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) return <div className="loading">⏳ Загрузка...</div>;

  return (
    <div className="files-tab">
      <div className="tab-header">
        <h2>📁 Файлы в uploads/ ({files.length})</h2>
        <label className="btn-upload">
          {uploading ? '⏳ Загрузка...' : '📤 Загрузить фото'}
          <input type="file" accept="image/*" onChange={handleUpload} hidden disabled={uploading} />
        </label>
      </div>

      <div className="files-grid">
        {files.map(file => (
          <div key={file.filename} className={`file-card ${renamingFile === file.filename ? 'renaming' : ''}`}>
            <img src={`${API}${file.url}`} alt={file.filename} className="file-preview" />
            <div className="file-info">
              {renamingFile === file.filename ? (
                <div className="rename-input-wrapper">
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={handleRenameKeyDown}
                    className="rename-input"
                    autoFocus
                  />
                  <div className="rename-actions">
                    <button onClick={handleRename} className="rename-confirm" title="Сохранить">✅</button>
                    <button onClick={cancelRename} className="rename-cancel" title="Отмена">❌</button>
                  </div>
                </div>
              ) : (
                <p className="file-name" title={file.filename}>{file.filename}</p>
              )}
              <p className="file-size">{formatSize(file.size)}</p>
              {file.createdAt && <p className="file-date">{formatDate(file.createdAt)}</p>}
            </div>
            <div className="file-actions">
              <button onClick={() => copyToClipboard(file.filename)} title="Копировать имя">📋</button>
              <button onClick={() => startRename(file.filename)} title="Переименовать">✏️</button>
              <a href={`${API}${file.url}`} target="_blank" rel="noopener noreferrer" title="Открыть">🔗</a>
              <button onClick={() => handleDelete(file.filename)} title="Удалить">🗑️</button>
            </div>
          </div>
        ))}
        {files.length === 0 && <p className="empty">Нет файлов. Загрузите первое фото!</p>}
      </div>
    </div>
  );
}