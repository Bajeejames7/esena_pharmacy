import { ksh } from '@shared/format';
import { Button, Loading, Notice, Screen, useLoad, useNav } from '@shared/ui';
import { adminApi } from '../session';

export function Dashboard({ user, onSignOut }) {
  const nav = useNav();
  const { data, error, loading, reload } = useLoad(() => adminApi('/admin/dashboard/stats'), []);

  const tiles = data
    ? [
        ['Pending orders', data.pendingOrders, data.trends?.orders?.value, 'orders'],
        ['Pending appointments', data.pendingAppointments, null, 'appointments'],
        ['Products in stock', data.productsInStock, null, 'products'],
        [`Revenue${data.revenueMonthLabel ? ` · ${data.revenueMonthLabel}` : ''}`, ksh(data.totalRevenue), data.trends?.revenue?.value, null],
      ]
    : [];

  return (
    <Screen title="Dashboard" action={<button onClick={onSignOut}>Sign out</button>}>
      <div className="stack">
        <p className="muted small">Signed in as {user?.full_name || user?.username || 'staff'}{user?.role ? ` · ${user.role}` : ''}</p>
        {loading ? <Loading /> : null}
        {error ? <Notice tone="bad">{error.message}</Notice> : null}
        <div className="tiles">
          {tiles.map(([label, value, trend, target]) => (
            <button key={label} className="tile" onClick={() => target && nav.reset(target)} disabled={!target}>
              <span className="tile-value">{value ?? '—'}</span>
              <span className="tile-label">{label}</span>
              {trend ? <span className="small muted">{trend} vs last month</span> : null}
            </button>
          ))}
        </div>
        <Button variant="ghost" onClick={() => nav.reset('prescriptions')}>Review prescriptions</Button>
        <Button variant="ghost" onClick={reload}>Refresh</Button>
      </div>
    </Screen>
  );
}
