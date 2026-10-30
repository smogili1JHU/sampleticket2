import { useEffect, useState } from 'react';

export default function CategoryDropdown({ value, onChange }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        fetch('/api/ticketcategories', { signal: controller.signal })
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(setCategories)
            .catch(err => {
                if (err.name !== 'AbortError') setError(err.message);
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, []);

    if (error) return <p>Could not load categories: {error}</p>;

    return (
        <label>
            Category{' '}
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                disabled={loading}
            >
                <option value="">
                    {loading ? 'Loading...' : 'Select a category'}
                </option>
                {categories.map(c => (
                    <option key={c.id} value={c.id}>
                        {c.name}
                    </option>
                ))}
            </select>
        </label>
    );
}