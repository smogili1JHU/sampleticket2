import { useEffect, useState } from 'react';

export default function TicketList({ refreshKey }) {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);

        fetch('/api/tickets', { signal: controller.signal })
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => {
                setTickets(data);
                setError(null);
            })
            .catch(err => {
                if (err.name !== 'AbortError') setError(err.message);
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [refreshKey]);

    if (error) return <p role="alert">Could not load tickets: {error}</p>;
    if (loading && tickets.length === 0) return <p>Loading tickets...</p>;
    if (tickets.length === 0) return <p>No tickets yet.</p>;

    return (
        <ul className="ticket-grid">
            {tickets.map(t => (
                <li key={t.id} className={`ticket-card priority-${t.priority.toLowerCase()}`}>
                    <div className="ticket-card-header">
                        <span className="ticket-id">#{t.id}</span>
                        <span className="ticket-priority">{t.priority}</span>
                    </div>

                    <div className="ticket-category">{t.categoryName}</div>

                    <div className="ticket-contact">
                        <strong>{t.name}</strong>
                        <span>{t.email}</span>
                    </div>

                    <p className="ticket-description">{t.description}</p>

                    <div className="ticket-footer">
                        <small>Created {new Date(t.createdAt).toLocaleString()}</small>
                        {t.dueDate && <small>Due {t.dueDate}</small>}
                    </div>
                </li>
            ))}
        </ul>
    );
}