import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import AdminPanel from './AdminPanel';

// Types
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
  specs?: { label: string; value: string }[];
}

// Get image URL
const getImageUrl = (filename: string) => {
  if (filename.startsWith('http')) return filename;
  return `http://localhost:3000/products/image/${filename}`;
};

// Random coordinates for Google Maps
const randomLocations = [
  { lat: 55.7558, lng: 37.6176, name: 'Moscow' },
  { lat: 59.9343, lng: 30.3351, name: 'Saint Petersburg' },
  { lat: 56.8389, lng: 60.6057, name: 'Ekaterinburg' },
  { lat: 55.7961, lng: 49.1064, name: 'Kazan' },
  { lat: 54.9893, lng: 73.3682, name: 'Omsk' },
  { lat: 45.0355, lng: 38.9753, name: 'Krasnodar' },
  { lat: 51.5336, lng: 46.0343, name: 'Saratov' },
  { lat: 48.7071, lng: 44.5169, name: 'Volgograd' },
];

const getRandomLocation = () => randomLocations[Math.floor(Math.random() * randomLocations.length)];

const getGoogleMapsUrl = () => {
  const loc = getRandomLocation();
  return `https://www.google.com/maps?q=${loc.lat},${loc.lng}&z=12&output=embed`;
};

const categories = ['All', 'Tractors', 'Combines', 'Tillage', 'Seeding', 'Crop Protection', 'Mowers'];

// Contact form component
function ContactForm({ type, onClose }: { type: 'call' | 'question'; onClose: () => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = type === 'call'
        ? 'http://localhost:3000/products/contact/callback'
        : 'http://localhost:3000/products/contact/question';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, message }),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          onClose();
          setSubmitted(false);
          setName('');
          setPhone('');
          setMessage('');
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        {submitted ? (
          <div className="success-message">
            <div className="success-icon">✅</div>
            <h2>Request sent!</h2>
            <p>We will contact you shortly</p>
          </div>
        ) : (
          <>
            <h2>{type === 'call' ? '📞 Request a call' : '💬 Ask a question'}</h2>
            <p className="form-subtitle">
              {type === 'call'
                ? 'Leave your phone number and we will call you back within 15 minutes'
                : 'Ask any question about equipment, delivery or warranty'}
            </p>

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label>Your name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
              </div>

              <div className="form-group">
                <label>Phone *</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 (999) 123-45-67" required />
              </div>

              <div className="form-group">
                <label>{type === 'call' ? 'Comment (optional)' : 'Your question *'}</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                  placeholder={type === 'call' ? 'Preferred time for a call, equipment of interest...' : 'Describe your question in detail...'}
                  rows={4} required={type === 'question'} />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? '⏳ Sending...' : type === 'call' ? '📞 Request a call' : '📤 Send question'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// Service form component
function ServiceForm({ type, title, onClose }: { type: string; title: string; onClose: () => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/products/contact/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          message: `${title}\n${message}`,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          onClose();
          setSubmitted(false);
          setName('');
          setPhone('');
          setMessage('');
        }, 2000);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const placeholders: Record<string, string> = {
    maintenance: 'Specify equipment model and desired maintenance date',
    diagnostics: 'Describe malfunction symptoms and equipment model',
    repair: 'Describe the breakdown, equipment model and exact address',
    parts: 'Specify part name, equipment model and VIN (if available)',
    delivery: 'Specify equipment, pickup and delivery addresses',
    warranty: 'Describe the issue and attach photos if possible',
    return: 'Specify order number and reason for return/exchange',
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        {submitted ? (
          <div className="success-message">
            <div className="success-icon">✅</div>
            <h2>Request sent!</h2>
            <p>A specialist will contact you shortly</p>
          </div>
        ) : (
          <>
            <h2>{title}</h2>
            <p className="form-subtitle">Fill out the form and we will contact you within an hour</p>

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label>Your name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
              </div>

              <div className="form-group">
                <label>Phone *</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 (999) 123-45-67" required />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={placeholders[type] || 'Describe your request'}
                  rows={4}
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? '⏳ Sending...' : '📤 Send request'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// HOME PAGE - Catalog
function HomePage() {
  const [showCallbackForm, setShowCallbackForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    priceRange: 50000000,
    inStockOnly: false
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:3000/products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filtered = products.filter(p => {
    if (filters.category !== 'All' && p.category !== filters.category) return false;
    if (filters.search && !p.name.toLowerCase().includes(filters.search.toLowerCase()) && !p.category.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.inStockOnly && !p.inStock) return false;
    const priceNum = parseInt(p.price.replace(/[^0-9]/g, ''));
    if (priceNum > filters.priceRange) return false;
    return true;
  });

  return (
    <div className="main-content">
      <aside className="filters">
        <h3>Filters</h3>
        <div className="filter-group">
          <label>🔍 Search</label>
          <input type="text" placeholder="Name or category..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} />
        </div>
        <div className="filter-group">
          <label>📁 Category</label>
          <select value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>💰 Price up to: ₽{filters.priceRange.toLocaleString()}</label>
          <input type="range" min="100000" max="50000000" step="500000" value={filters.priceRange} onChange={e => setFilters({ ...filters, priceRange: Number(e.target.value) })} />
        </div>
        <div className="filter-group checkbox">
          <label><input type="checkbox" checked={filters.inStockOnly} onChange={e => setFilters({ ...filters, inStockOnly: e.target.checked })} /> ✅ In stock only</label>
        </div>

        <div className="contact-buttons">
          <button className="callback-btn" onClick={() => setShowCallbackForm(true)}>📞 Request a call</button>
          <button className="question-btn" onClick={() => setShowQuestionForm(true)}>💬 Ask a question</button>
        </div>
      </aside>

      <div className="products-grid">
        {loading ? (
          <div className="no-results">⏳ Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="no-results">🚜 Nothing found</div>
        ) : (
          filtered.map(p => (
            <div key={p.id} className="product-card">
              <img src={getImageUrl(p.image)} alt={p.name} />
              <div className="product-badge">{p.category}</div>
              <h3>{p.name}</h3>
              <p className="price">{p.price}</p>
              <p className="specs">⚡ {p.hp} hp | 📅 {p.year}</p>
              <span className={p.inStock ? 'in-stock' : 'out-stock'}>{p.inStock ? 'In stock' : 'Out of stock'}</span>
              <button className="details-btn" onClick={() => setSelectedProduct(p)}>Details →</button>
            </div>
          ))
        )}
      </div>

      {showCallbackForm && <ContactForm type="call" onClose={() => setShowCallbackForm(false)} />}
      {showQuestionForm && <ContactForm type="question" onClose={() => setShowQuestionForm(false)} />}
      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </div>
  );
}

// PRODUCT MODAL
function ProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [showCallbackForm, setShowCallbackForm] = useState(false);

  const specs = typeof product.specs === 'string' 
    ? JSON.parse(product.specs) 
    : product.specs;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>×</button>
          <div className="product-detail">
            <img src={getImageUrl(product.image)} alt={product.name} className="detail-image" />
            <div className="detail-info">
              <h2>{product.name}</h2>
              <p className="detail-category">{product.category}</p>
              <p className="detail-price">{product.price}</p>
              <div className="detail-specs">
                <span>⚡ Power: {product.hp} hp</span>
                <span>📅 Year: {product.year}</span>
                <span>{product.inStock ? '✅ In stock' : '❌ Out of stock'}</span>
              </div>
              {specs && Array.isArray(specs) && (
                <div className="detail-specs-list">
                  {specs.map((s: any, i: number) => (
                    <div key={i}><strong>{s.label}:</strong> {s.value}</div>
                  ))}
                </div>
              )}
              <p className="detail-description">{product.description}</p>
              <button className="order-btn" onClick={() => setShowCallbackForm(true)}>📞 Request price</button>
            </div>
          </div>
        </div>
      </div>
      {showCallbackForm && <ContactForm type="call" onClose={() => setShowCallbackForm(false)} />}
    </>
  );
}

// INVENTORY PAGE
function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch('http://localhost:3000/products')
      .then(res => res.json())
      .then(setProducts)
      .catch(console.error);
  }, []);

  return (
    <div className="page-content">
      <h1>Full Inventory</h1>
      <div className="stats-grid">
        <div className="stat-card"><span className="stat-number">{products.length}</span><span>Equipment models</span></div>
        <div className="stat-card"><span className="stat-number">{products.filter(p => p.inStock).length}</span><span>In stock</span></div>
        <div className="stat-card"><span className="stat-number">{new Set(products.map(p => p.category)).size}</span><span>Categories</span></div>
        <div className="stat-card"><span className="stat-number">24/7</span><span>Support</span></div>
      </div>
      <div className="brands-showcase">
        <h2>Our Brands</h2>
        <div className="brands-grid">
          {['John Deere', 'CLAAS', 'Kverneland', 'Horsch', 'Amazone', 'Kuhn', 'New Holland', 'Massey Ferguson'].map(b => (
            <div key={b} className="brand-chip">{b}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// MAINTENANCE PAGE
function MaintenancePage() {
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'maintenance' | 'diagnostics' | 'repair' | 'parts'>('maintenance');

  const openForm = (type: 'maintenance' | 'diagnostics' | 'repair' | 'parts') => {
    setFormType(type);
    setShowForm(true);
  };

  const formTitles: Record<string, string> = {
    maintenance: 'Schedule Maintenance',
    diagnostics: 'Order Diagnostics',
    repair: 'Call a Technician',
    parts: 'Request Parts',
  };

  return (
    <div className="page-content">
      <h1>🔧 Maintenance & Service</h1>
      <div className="services-grid">
        <div className="service-card">
          <div className="service-icon">🛠️</div>
          <h3>Maintenance & Repair</h3>
          <p>Scheduled maintenance of any complexity</p>
          <ul className="service-features">
            <li>✅ Oil and filter change</li>
            <li>✅ Components adjustment</li>
            <li>✅ Computer calibration</li>
          </ul>
          <button className="cta-btn" onClick={() => openForm('maintenance')}>
            📅 Schedule Maintenance
          </button>
        </div>
        <div className="service-card">
          <div className="service-icon">🔍</div>
          <h3>Diagnostics</h3>
          <p>Computer diagnostics of all systems</p>
          <ul className="service-features">
            <li>✅ Engine & transmission</li>
            <li>✅ Hydraulic system</li>
            <li>✅ Electronic control units</li>
          </ul>
          <button className="cta-btn" onClick={() => openForm('diagnostics')}>
            🔍 Order Diagnostics
          </button>
        </div>
        <div className="service-card">
          <div className="service-icon">⚡</div>
          <h3>Mobile Service Team</h3>
          <p>Prompt on-site repair service</p>
          <ul className="service-features">
            <li>✅ Arrival within 2 hours</li>
            <li>✅ Field repair</li>
            <li>✅ Full tool kit</li>
          </ul>
          <button className="cta-btn accent" onClick={() => openForm('repair')}>
            🚨 Emergency Call
          </button>
        </div>
        <div className="service-card">
          <div className="service-icon">📦</div>
          <h3>Genuine Parts</h3>
          <p>24/7 parts warehouse</p>
          <ul className="service-features">
            <li>✅ OEM parts</li>
            <li>✅ Nationwide delivery</li>
            <li>✅ Urgent order within 24h</li>
          </ul>
          <button className="cta-btn" onClick={() => openForm('parts')}>
            📦 Request Parts
          </button>
        </div>
      </div>

      {showForm && (
        <ServiceForm
          type={formType}
          title={formTitles[formType]}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

// DELIVERY PAGE
function DeliveryPage() {
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');

  const handleCardClick = (title: string) => {
    setFormTitle(title);
    setShowForm(true);
  };

  return (
    <div className="page-content">
      <h1>🚚 Nationwide Delivery</h1>
      <div className="delivery-info">
        <div className="delivery-feature clickable" onClick={() => handleCardClick('Calculate Delivery Cost')}>
          <h3>📍 Free Delivery</h3>
          <p>For orders over ₽5,000,000 within Moscow Ring Road</p>
          <span className="card-cta">Calculate cost →</span>
        </div>
        <div className="delivery-feature clickable" onClick={() => handleCardClick('Regional Delivery')}>
          <h3>🗺️ Across Russia</h3>
          <p>We deliver to any region via transport companies</p>
          <span className="card-cta">Check delivery times →</span>
        </div>
        <div className="delivery-feature clickable" onClick={() => handleCardClick('Express Delivery')}>
          <h3>⏱️ Delivery Times</h3>
          <p>From 1 day in Moscow, from 3 days across Russia</p>
          <span className="card-cta">Order express →</span>
        </div>
        <div className="delivery-feature clickable" onClick={() => handleCardClick('Cargo Insurance')}>
          <h3>🛡️ Cargo Insurance</h3>
          <p>Equipment insured during transportation</p>
          <span className="card-cta">Learn more →</span>
        </div>
      </div>

      <div className="delivery-extra">
        <h2>🚛 How We Deliver</h2>
        <div className="delivery-steps">
          <div className="step">
            <div className="step-number">1</div>
            <h4>Place Order</h4>
            <p>Submit a request or call us</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">2</div>
            <h4>Equipment Prep</h4>
            <p>We inspect and prepare for shipment</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">3</div>
            <h4>Transportation</h4>
            <p>Delivery by your preferred method</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">4</div>
            <h4>Receiving</h4>
            <p>Equipment and documents handover</p>
          </div>
        </div>
      </div>

      {showForm && (
        <ServiceForm
          type="delivery"
          title={`🚚 ${formTitle}`}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

// GUARANTEE PAGE
function GuaranteePage() {
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);

  return (
    <div className="page-content">
      <h1>✅ Warranty & Returns</h1>
      <div className="guarantee-grid">
        <div className="guarantee-card">
          <h2>🎯 100% Money Back</h2>
          <p>If the equipment doesn't fit — full refund within 14 days</p>
          <ul className="guarantee-features">
            <li>✅ No questions asked</li>
            <li>✅ Full refund</li>
            <li>✅ Free pickup</li>
          </ul>
          <button className="cta-btn" onClick={() => setShowReturnForm(true)}>
            ↩️ Request Return
          </button>
        </div>
        <div className="guarantee-card">
          <h2>📋 3-Year Warranty</h2>
          <p>Extended warranty on all new equipment</p>
          <ul className="guarantee-features">
            <li>✅ All components covered</li>
            <li>✅ Free maintenance 1st year</li>
            <li>✅ Factory defect replacement</li>
          </ul>
          <button className="cta-btn accent" onClick={() => setShowClaimForm(true)}>
            📋 Warranty Claim
          </button>
        </div>
        <div className="guarantee-card">
          <h2>🤝 Free Exchange</h2>
          <p>Defective equipment replaced same day</p>
          <ul className="guarantee-features">
            <li>✅ No extra charges</li>
            <li>✅ New equipment delivery</li>
            <li>✅ Downtime compensation</li>
          </ul>
          <button className="cta-btn" onClick={() => setShowReturnForm(true)}>
            🔄 Exchange Equipment
          </button>
        </div>
      </div>

      <div className="warranty-info">
        <h2>📄 Full Warranty Terms</h2>
        <div className="warranty-terms">
          <ul>
            <li>✅ Warranty covers all components and assemblies</li>
            <li>✅ Free maintenance in the first year of operation</li>
            <li>✅ Replacement of factory defective parts</li>
            <li>✅ 24/7 warranty hotline</li>
            <li>✅ Claim processing within 24 hours</li>
            <li>✅ Same-day technician dispatch</li>
          </ul>
        </div>
      </div>

      {showClaimForm && (
        <ServiceForm
          type="warranty"
          title="📋 Warranty Claim"
          onClose={() => setShowClaimForm(false)}
        />
      )}
      {showReturnForm && (
        <ServiceForm
          type="return"
          title="↩️ Return / Exchange"
          onClose={() => setShowReturnForm(false)}
        />
      )}
    </div>
  );
}

// WARRANTY TERMS PAGE
function WarrantyPage() {
  return (
    <div className="page-content">
      <h1>📄 Warranty Terms</h1>
      <div className="warranty-terms">
        <ul>
          <li>✅ Warranty covers all components and assemblies</li>
          <li>✅ Free maintenance in the first year of operation</li>
          <li>✅ Replacement of factory defective parts</li>
          <li>✅ 24/7 warranty hotline</li>
        </ul>
      </div>
    </div>
  );
}

// ABOUT PAGE
function AboutPage() {
  return (
    <div className="page-content">
      <h1>📌 About AgroTech</h1>
      <div className="about-content">
        <p>We are an official dealer of leading global agricultural equipment manufacturers since 2010.</p>
        <div className="about-stats">
          <div><strong>500+</strong><br/>clients</div>
          <div><strong>1500+</strong><br/>units sold</div>
          <div><strong>50+</strong><br/>employees</div>
          <div><strong>98%</strong><br/>satisfied clients</div>
        </div>
      </div>
    </div>
  );
}

// CONTACTS PAGE
function ContactsPage() {
  const [mapUrl, setMapUrl] = useState('');

  useEffect(() => {
    setMapUrl(getGoogleMapsUrl());
  }, []);

  return (
    <div className="page-content">
      <h1>📍 Our Locations</h1>
      <div className="map-container">
        <div className="map-header">
          <h2>Random location</h2>
          <button onClick={() => setMapUrl(getGoogleMapsUrl())} className="refresh-map-btn">🔄 Show another</button>
        </div>
        <div className="map-wrapper">
          <iframe src={mapUrl} width="100%" height="450" style={{ border: 0, borderRadius: '20px' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      </div>
    </div>
  );
}

// NAVIGATION
function NavLinks() {
  const location = useLocation();

  const links = [
    { to: '/', label: 'CATALOG' },
    { to: '/maintenance', label: 'SERVICE' },
    { to: '/delivery', label: 'DELIVERY' },
    { to: '/guarantee', label: 'WARRANTY' },
    { to: '/contacts', label: 'CONTACTS' },
  ];

  return (
    <nav className="nav-links">
      {links.map(link => (
        <Link
          key={link.to}
          to={link.to}
          className={location.pathname === link.to ? 'active' : ''}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

// HERO
function Hero() {
  const location = useLocation();
  if (location.pathname !== '/') return null;

  return (
    <div className="hero">
      <h1>AgroTech — <span className="yellow-text">the future of industry</span></h1>
      <p>Official dealer | Quality guarantee | 24/7 Service</p>
      <Link to="/" className="hero-btn">View Catalog →</Link>
    </div>
  );
}

// LAYOUT
function Layout() {
  return (
    <div className="app">
      <header className="header">
        <Link to="/" className="logo">
          <svg width="40" height="40" viewBox="0 0 50 50" fill="none">
            <rect x="8" y="20" width="34" height="16" rx="3" fill="#FFB800" />
            <rect x="12" y="28" width="26" height="8" rx="2" fill="#1A1A1A" />
            <circle cx="18" cy="36" r="5" fill="#1A1A1A" stroke="#FFB800" strokeWidth="2" />
            <circle cx="32" cy="36" r="5" fill="#1A1A1A" stroke="#FFB800" strokeWidth="2" />
            <rect x="22" y="12" width="6" height="10" fill="#FFB800" />
            <path d="M20 22 L30 22 L34 18 L16 18 L20 22Z" fill="#1A1A1A" />
            <rect x="28" y="14" width="8" height="4" rx="1" fill="#1A1A1A" />
          </svg>
          <span>Agro<span>Tech</span></span>
        </Link>
        <NavLinks />
      </header>

      <Hero />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/delivery" element={<DeliveryPage />} />
        <Route path="/guarantee" element={<GuaranteePage />} />
        <Route path="/warranty" element={<WarrantyPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section"><h4>AgroTech</h4><p>Reliable agricultural equipment since 2010</p></div>
          <div className="footer-section"><h4>Contacts</h4><p>📞 8 (800) 555-35-35</p><p>✉️ info@agrotech.ru</p></div>
          <div className="footer-section"><h4>Address</h4><p>📍 Moscow, Tekhnicheskaya st., 15</p></div>
        </div>
        <div className="footer-links">
          <Link to="/about">About Us</Link>
          <Link to="/warranty">Warranty</Link>
          <Link to="/admin">🔐 Admin</Link>
        </div>
        <p className="copyright">© 2025 AgroTech — All agricultural equipment for your business</p>
      </footer>
    </div>
  );
}

// APP ROOT
export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}