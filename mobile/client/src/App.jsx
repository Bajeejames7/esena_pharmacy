import { NavProvider, TabBar, useNav } from '@shared/ui';
import { useCart } from './store';
import { Shop } from './screens/Shop';
import { Product } from './screens/Product';
import { Cart } from './screens/Cart';
import { Checkout } from './screens/Checkout';
import { Pay } from './screens/Pay';
import { Orders, Track } from './screens/Orders';
import { Appointment, Book, Contact, Prescription, Services } from './screens/Services';

const SCREENS = { shop: Shop, product: Product, cart: Cart, checkout: Checkout, pay: Pay, orders: Orders, track: Track, services: Services, book: Book, appointment: Appointment, prescription: Prescription, contact: Contact };

/** Which tab a screen belongs to, so the bar stays lit on pushed screens. */
const TAB_OF = { shop: 'shop', product: 'shop', cart: 'cart', checkout: 'cart', pay: 'cart', orders: 'orders', track: 'orders', appointment: 'orders', services: 'services', book: 'services', prescription: 'services', contact: 'services' };

function Shell() {
  const nav = useNav();
  const cart = useCart();
  const Current = SCREENS[nav.top.name] ?? Shop;
  const tabs = [
    { name: 'shop', label: 'Shop', icon: '🏪' },
    { name: 'cart', label: 'Cart', icon: '🛒', count: cart.count },
    { name: 'orders', label: 'Orders', icon: '📦' },
    { name: 'services', label: 'Services', icon: '🩺' },
  ];
  return (
    <div className="app">
      <Current key={`${nav.stack.length}-${nav.top.name}`} {...nav.top.params} />
      <TabBar tabs={tabs} current={TAB_OF[nav.top.name]} onSelect={(name) => nav.reset(name)} />
    </div>
  );
}

export function App() {
  return (
    <NavProvider initial={{ name: 'shop', params: {} }}>
      <Shell />
    </NavProvider>
  );
}
