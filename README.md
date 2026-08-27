# ExpenseBit

ExpenseBit is a lightweight, database-free expense tracker. Its complete state is compressed into the URL, making the current budget easy to refresh, bookmark, or share without an account.

## Features

- Monthly income and savings target
- Dynamic expense rows with quantity and unit-cost calculations
- Available, spent, and remaining budget totals
- Versioned, compressed link-based sharing
- Graceful handling of malformed or unsupported links
- Responsive table-to-card layout
- No database, backend, accounts, cookies, or browser storage

## Development

```bash
npm install
npm run dev
```

Run the test suite and production build:

```bash
npm test
npm run build
```

## How sharing works

Tracker values are validated, serialized into a compact structure, compressed, and written to a versioned URL hash such as `#v1:ENCODED_STATE`. The application uses `history.replaceState`, so edits update the current URL without refreshing the page or adding a browser-history entry for every keystroke.

Money is represented internally as integer centavos to avoid common floating-point addition errors. Version parsing and state validation are isolated from the user interface to support future migrations.

The link is the save file. ExpenseBit does not persist information on a server or device. Anyone who possesses the complete shared URL can decode and view the financial information in it, so only share links with people you trust.

## Deploying to Vercel

Push this repository to GitHub, import it into Vercel, and use the detected Vite defaults. Vercel will run `npm run build` and publish `dist/`. Since state lives in the URL hash and the app uses one route, shared links require no server-side routing or storage configuration.
