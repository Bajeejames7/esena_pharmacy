import { NavProvider, TabBar, useNav } from '@shared/ui';
import { useSession } from './session';
import { Login } from './screens/Login';
import { Dashboard } from './screens/Dashboard';
import { Order, Orders } from './screens/Orders';
import { Appointment, Appointments, Prescription, Prescriptions } from './screens/Care';
import { ProductEdit, Products } from './screens/Products';

const SCREENS = { dashboard: Dashboard, orders: Orders, order: Order, appointments: Appointments, appointment: Appointment, prescriptions: Prescriptions, prescription: Prescription, products: Products, product: ProductEdit };

const TAB_OF = { dashboard: 'dashboard', prescriptions: 'dashboard', prescription: 'dashboard', orders: 'orders', order: 'orders', appointments: 'appointments', appointment: 'appointments', products: 'products', product: 'products' };

const TABS = [
  { name: 'dashboard', label: 'Home', icon: '📊' },
  { name: 'orders', label: 'Orders', icon: '📦' },
  { name: 'appointments', label: 'Bookings', icon: '📅' },
  { name: 'products', label: 'Stock', icon: '💊' },
];

function Shell({ user, onSignOut }) {
  const nav = useNav();
  const Current = SCREENS[nav.top.name] ?? Dashboard;
  return (
    <div className="app">
      <Current key={`${nav.stack.length}-${nav.top.name}`} user={user} onSignOut={onSignOut} {...nav.top.params} />
      <TabBar tabs={TABS} current={TAB_OF[nav.top.name]} onSelect={(name) => nav.reset(name)} />
    </div>
  );
}

export function App() {
  const { session, signIn, signOut } = useSession();
  if (!session) return <Login onSignedIn={signIn} />;
  return (
    <NavProvider initial={{ name: 'dashboard', params: {} }}>
      <Shell user={session.user} onSignOut={signOut} />
    </NavProvider>
  );
}
