import { useState } from 'react';
import CategoryDropdown from './CategoryDropdown';

const MAX_DESCRIPTION = 500;
const PRIORITIES = ['Low', 'Medium', 'High'];
const FIELDS = ['name', 'email', 'categoryId', 'priority', 'description', 'dueDate'];

// ASP.NET Core returns { errors: { "Email": ["..."], "$.dueDate": ["..."] } } on a 400.
// Normalize each key to match our field names (case-insensitive, strips "$.").
function mapServerErrors(problem) {
    const fieldErrors = {};
    const unmatched = [];

    for (const [key, messages] of Object.entries(problem?.errors ?? {})) {
        const cleaned = key.replace(/^\$\./, '');
        const field = FIELDS.find(f => f.toLowerCase() === cleaned.toLowerCase());
        const text = Array.isArray(messages) ? messages.join(' ') : String(messages);

        if (field) fieldErrors[field] = text;
        else unmatched.push(text);
    }
    return { fieldErrors, unmatched };
}

// Local date as YYYY-MM-DD (toISOString would use UTC and can be off by a day)
const today = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
};

const emptyForm = {
    name: '',
    email: '',
    categoryId: '',
    priority: 'Medium',
    description: '',
    dueDate: ''
};

export default function TicketForm({ onCreated }) {
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState({ type: '', message: '' });
    const [submitting, setSubmitting] = useState(false);

    const setField = (field, value) =>
        setForm(f => ({ ...f, [field]: value }));

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Name is required.';
        if (!form.email.trim()) e.email = 'Email is required.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            e.email = 'Enter a valid email address.';
        if (!form.categoryId) e.categoryId = 'Choose a category.';
        if (!form.description.trim()) e.description = 'Description is required.';
        if (form.dueDate && form.dueDate < today())
            e.dueDate = 'Due date cannot be in the past.';
        return e;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        const e = validate();
        setErrors(e);
        if (Object.keys(e).length > 0) return;

        setSubmitting(true);
        setStatus({ type: '', message: '' });
        try {
            const res = await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name.trim(),
                    email: form.email.trim(),
                    categoryId: Number(form.categoryId),
                    priority: form.priority,
                    description: form.description.trim(),
                    dueDate: form.dueDate || null
                })
            });

            if (res.status === 400) {
                // The body may not be JSON, so parse defensively
                const problem = await res.json().catch(() => null);
                const { fieldErrors, unmatched } = mapServerErrors(problem);

                setErrors(fieldErrors);
                if (Object.keys(fieldErrors).length === 0 || unmatched.length > 0) {
                    setStatus({
                        type: 'error',
                        message: unmatched.join(' ') || problem?.title || 'The server rejected the ticket. Please check your entries.'
                    });
                } else {
                    setStatus({ type: 'error', message: 'Please fix the highlighted fields.' });
                }
                return;
            }

            if (!res.ok) {
                // 500, 502, 503 etc.
                setStatus({
                    type: 'error',
                    message: 'Something went wrong on our end. Please try again in a moment.'
                });
                return;
            }

            const created = await res.json();
            setStatus({ type: 'success', message: `Ticket #${created.id} submitted.` });
            setForm(emptyForm);
            onCreated?.();
        } catch {
            // fetch itself threw: network failure or API unreachable
            setStatus({
                type: 'error',
                message: 'Could not reach the server. Check your connection and try again.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate style={{ display: 'grid', gap: '1rem', maxWidth: 480, textAlign: 'left' }}>
            <div>
                <label htmlFor="name">Name</label><br />
                <input id="name" type="text" value={form.name}
                    onChange={e => setField('name', e.target.value)} />
                {errors.name && <div role="alert" style={{ color: 'crimson' }}>{errors.name}</div>}
            </div>

            <div>
                <label htmlFor="email">Email</label><br />
                <input id="email" type="email" value={form.email}
                    onChange={e => setField('email', e.target.value)} />
                {errors.email && <div role="alert" style={{ color: 'crimson' }}>{errors.email}</div>}
            </div>

            <div>
                <CategoryDropdown value={form.categoryId}
                    onChange={v => setField('categoryId', v)} />
                {errors.categoryId && <div role="alert" style={{ color: 'crimson' }}>{errors.categoryId}</div>}
            </div>

            <fieldset>
                <legend>Priority</legend>
                {PRIORITIES.map(p => (
                    <label key={p} style={{ marginRight: '1rem' }}>
                        <input type="radio" name="priority" value={p}
                            checked={form.priority === p}
                            onChange={e => setField('priority', e.target.value)} />
                        {' '}{p}
                    </label>
                ))}
                {errors.priority && <div role="alert" style={{ color: 'crimson' }}>{errors.priority}</div>}
            </fieldset>

            <div>
                <label htmlFor="description">Description</label><br />
                <textarea id="description" rows={5} cols={40}
                    maxLength={MAX_DESCRIPTION}
                    value={form.description}
                    onChange={e => setField('description', e.target.value)} />
                <div aria-live="polite">
                    {form.description.length} / {MAX_DESCRIPTION}
                </div>
                {errors.description && <div role="alert" style={{ color: 'crimson' }}>{errors.description}</div>}
            </div>

            <div>
                <label htmlFor="dueDate">Due date (optional)</label><br />
                <input id="dueDate" type="date" min={today()} value={form.dueDate}
                    onChange={e => setField('dueDate', e.target.value)} />
                {errors.dueDate && <div role="alert" style={{ color: 'crimson' }}>{errors.dueDate}</div>}
            </div>

            {status.message && (
                <div role={status.type === 'error' ? 'alert' : 'status'}
                    style={{ color: status.type === 'error' ? 'crimson' : 'green' }}>
                    {status.message}
                </div>
            )}

            <button type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Ticket'}
            </button>
        </form>
    );
}