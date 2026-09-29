# Esena Pharmacy mobile apps

Two Android apps, built with React + Vite + [Capacitor](https://capacitorjs.com), talking
to the **same live API the website uses** (`https://api.esena.co.ke/api`). No backend
change was needed.

| App | Folder | Package | Who it is for |
|---|---|---|---|
| **Esena Pharmacy** | `client/` | `ke.co.esena.shop` | Customers |
| **Esena Admin** | `admin/` | `ke.co.esena.admin` | Pharmacy staff |

`shared/` holds what both use: the API client, the UI kit, the theme (brand navy, green
and sky blue from the logo), formatting, and the product categories (a copy of
`frontend/src/utils/categories.js` — keep the two in step).

## What each app does

**Client** — browse and search the catalogue by category · product page · cart ·
checkout (delivery or pickup, fees from `/settings/delivery`) · pay with **M-Pesa STK
push** (Kopo Kopo, `/k2/stkpush` + status polling) or cash · track and cancel an order by
its code · "My orders" (codes remembered on the phone — there are no customer accounts) ·
book an appointment with live free-slot checking · upload a prescription (camera or file) ·
contact form (phone required, like the website).

**Admin** — sign in with the website's staff accounts, including **2FA** · dashboard ·
orders with search and filters, details, **status changes limited to what the server
allows**, delivery-fee edits and cancellation · appointments and status · prescriptions,
with the file loaded through the staff-only `/prescriptions/:id/file` · stock: search, low
stock filter, and **stock movements** (restock / adjustment / damaged / return) through
`/inventory/:id/movements`, so every change is in the stock history with the staff name.

Deliberately left to the website admin for now: editing prices, photos and descriptions,
creating products, turning a prescription into a priced order, blogs, reports. Price
editing in particular is blocked by a server bug: the product `PUT` HTML-escapes the name
it must be sent back (`200MG/5ML` → `200MG&#x2F;5ML`), so editing through it would
corrupt product names.

## Why no CORS change was needed

The API only allows the website's origins. Inside the Android app every `fetch()` goes
through Capacitor's native HTTP layer (`CapacitorHttp` in each `capacitor.config.json`),
which is not subject to CORS. The apps therefore work against the live API as-is.

In a desktop browser (for development) CORS still applies, and the API allows
`http://localhost:3000` and `:3001`, so run the dev servers on those ports:

```bash
cd mobile
npm install
npm run dev -w client -- --port 3000     # or: -w admin -- --port 3001
```

To point either app at a local backend: `VITE_API_URL=http://localhost:5000/api`.
Careful — the local backend's `.env` points at the live POS, so an order placed against
a local backend still tries to deduct real POS stock.

## Building the APKs

Needs Android Studio (for the SDK and its bundled Java).

```bash
cd mobile
npm install
npm run android:client        # web build + copy into client/android
npm run android:admin
# Windows: set JAVA_HOME to Android Studio's jbr, then
cd client/android && gradlew assembleDebug   # → app/build/outputs/apk/debug/app-debug.apk
```

The Gradle wrapper is 9.1 because Android Studio ships Java 25, which Gradle 8 cannot run
on. Launcher icons and splash screens are generated from the Esena logo with
`node scripts/android-icons.mjs client|admin` (the admin icon carries an "ADMIN" band).

A Play Store release needs a signing key, which is deliberately not in this repository.
