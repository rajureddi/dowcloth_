import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { PRODUCTS } from '../data/products';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';

const SORT_OPTIONS = [
  { id: 'relevance',  label: 'Relevance' },
  { id: 'price_asc',  label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
  { id: 'rating',     label: 'Highest Rated' },
  { id: 'newest',     label: 'Newest First' },
];

const SUB_CATEGORIES = {
  women:       ['All', 'Dresses', 'Tops', 'Bottomwear', 'Ethnic', 'Blazers', 'Hoodies'],
  men:         ['All', 'Shirts', 'T-Shirts', 'Bottomwear', 'Ethnic', 'Blazers', 'Hoodies'],
  kids:        ['All', 'Tops', 'Bottomwear', 'Dresses'],
  footwear:    ['All', 'Sneakers', 'Formal', 'Heels', 'Casual', 'Sports'],
  accessories: ['All', 'Bags', 'Watches', 'Belts', 'Wallets', 'Sunglasses', 'Hair'],
};


const CAT_LABELS = {
  women: 'Women', men: 'Men', kids: 'Kids',
  footwear: 'Footwear', accessories: 'Accessories',
  ethnic: 'Ethnic',
};

export default function CategoriesScreen() {
  const { name } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const catKey = name?.toLowerCase() || 'women';
  const catLabel = CAT_LABELS[catKey] || name;

  const [sort, setSort] = useState('relevance');
  const [subCat, setSubCat] = useState(searchParams.get('sub') || 'All');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [minRating, setMinRating] = useState(0);
  const [loading] = useState(false);
  const [mobileFilter, setMobileFilter] = useState(false);

  // Sync subcategory when URL params change (e.g. clicking header links)
  React.useEffect(() => {
    setSubCat(searchParams.get('sub') || 'All');
  }, [searchParams, catKey]);

  const subCategories = SUB_CATEGORIES[catKey] || ['All'];

  const filtered = useMemo(() => {
    let list = PRODUCTS.filter(p => {
      const matchCat = catKey === 'ethnic'
        ? p.subCategory === 'Ethnic'
        : p.category.toLowerCase() === catKey;
      const matchSub = subCat === 'All' || p.subCategory === subCat;
      const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      const matchRating = p.rating >= minRating;
      return matchCat && matchSub && matchPrice && matchRating;
    });

    switch (sort) {
      case 'price_asc':  return [...list].sort((a, b) => a.price - b.price);
      case 'price_desc': return [...list].sort((a, b) => b.price - a.price);
      case 'rating':     return [...list].sort((a, b) => b.rating - a.rating);
      case 'newest':     return [...list].filter(p => p.isNew).concat(list.filter(p => !p.isNew));
      default: return list;
    }
  }, [catKey, subCat, priceRange, minRating, sort]);

  const FilterPanel = () => (
    <div className="dc-filter-sidebar">
      {/* Sub-category */}
      <div className="dc-filter-group">
        <div className="dc-filter-title">Category</div>
        {subCategories.map(s => (
          <label key={s} className="dc-filter-checkbox" onClick={() => setSubCat(s)}>
            <div style={{ width: 16, height: 16, border: '1.5px solid', borderColor: subCat === s ? 'var(--dc-black)' : 'var(--dc-border)', borderRadius: 3, background: subCat === s ? 'var(--dc-black)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {subCat === s && <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>✓</span>}
            </div>
            {s}
          </label>
        ))}
      </div>

      {/* Price */}
      <div className="dc-filter-group">
        <div className="dc-filter-title">Price Range</div>
        <div style={{ fontSize: 13, color: 'var(--dc-text-secondary)', marginBottom: 10 }}>
          ₹{priceRange[0].toLocaleString()} – ₹{priceRange[1].toLocaleString()}
        </div>
        <input
          type="range" min={0} max={10000} step={100}
          value={priceRange[1]}
          onChange={e => setPriceRange([priceRange[0], +e.target.value])}
          style={{ width: '100%', accentColor: 'var(--dc-black)' }}
        />
      </div>

      {/* Rating */}
      <div className="dc-filter-group">
        <div className="dc-filter-title">Minimum Rating</div>
        {[4.5, 4, 3, 0].map(r => (
          <label key={r} className="dc-filter-checkbox" style={{ marginBottom: 8 }} onClick={() => setMinRating(r)}>
            <div style={{ width: 16, height: 16, border: '1.5px solid', borderColor: minRating === r ? 'var(--dc-black)' : 'var(--dc-border)', borderRadius: 3, background: minRating === r ? 'var(--dc-black)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {minRating === r && <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>✓</span>}
            </div>
            {r === 0 ? 'All' : `${r}★ & above`}
          </label>
        ))}
      </div>

      <button
        className="dc-btn dc-btn-ghost dc-btn-sm dc-btn-full"
        onClick={() => { setSubCat('All'); setPriceRange([0, 10000]); setMinRating(0); setSort('relevance'); }}
      >
        Clear All Filters
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      {/* Category Hero */}
      <div style={{ background: 'var(--dc-surface)', padding: 'var(--space-12) 0', borderBottom: '1px solid var(--dc-border-light)' }}>
        <div className="dc-container">
          <div style={{ display: 'flex', gap: 6, fontSize: 12, color: 'var(--dc-text-muted)', marginBottom: 12 }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, color: 'inherit' }} onClick={() => navigate('/')}>Home</button>
            <span>/</span>
            <span style={{ color: 'var(--dc-text-primary)', fontWeight: 500 }}>{catLabel}</span>
          </div>
          <h1 className="dc-heading-1">{catLabel}</h1>
          <p style={{ color: 'var(--dc-text-muted)', fontSize: 14, marginTop: 6 }}>
            {filtered.length} products
          </p>
        </div>
      </div>

      {/* Sub-category pills */}
      <div style={{ borderBottom: '1px solid var(--dc-border-light)', padding: '16px 0' }}>
        <div className="dc-container">
          <div className="dc-cat-strip">
            {subCategories.map(s => (
              <button
                key={s}
                className={`dc-cat-pill${subCat === s ? ' active' : ''}`}
                onClick={() => setSubCat(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="dc-container" style={{ padding: 'var(--space-8) var(--side-pad) var(--space-16)' }}>
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
          {/* Filter Sidebar */}
          <FilterPanel />

          {/* Right: Products */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Sort bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--dc-text-muted)' }}>
                Showing <strong style={{ color: 'var(--dc-text-primary)' }}>{filtered.length}</strong> results
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  className="dc-btn dc-btn-ghost dc-btn-sm"
                  style={{ display: 'none' }} // shown on mobile via CSS
                  onClick={() => setMobileFilter(true)}
                >
                  ☰ Filters
                </button>
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  style={{ height: 38, padding: '0 12px', border: '1.5px solid var(--dc-border)', borderRadius: 6, fontSize: 13, background: '#fff', cursor: 'pointer', fontFamily: 'var(--font-body)', color: 'var(--dc-text-primary)' }}
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.id} value={o.id}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active filter chips */}
            {(subCat !== 'All' || minRating > 0) && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {subCat !== 'All' && (
                  <span style={{ padding: '4px 12px', background: 'var(--dc-black)', color: '#fff', borderRadius: 999, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {subCat} <button onClick={() => setSubCat('All')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 12 }}>✕</button>
                  </span>
                )}
                {minRating > 0 && (
                  <span style={{ padding: '4px 12px', background: 'var(--dc-black)', color: '#fff', borderRadius: 999, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {minRating}★+ <button onClick={() => setMinRating(0)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 12 }}>✕</button>
                  </span>
                )}
              </div>
            )}

            {loading ? (
              <div className="dc-product-grid dc-product-grid-3">
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 12 }}>No products found</h3>
                <p style={{ color: 'var(--dc-text-muted)', marginBottom: 24 }}>Try adjusting your filters</p>
                <button className="dc-btn dc-btn-primary" onClick={() => { setSubCat('All'); setMinRating(0); }}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="dc-product-grid dc-product-grid-3">
                {filtered.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
