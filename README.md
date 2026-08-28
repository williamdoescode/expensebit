# Xpensed

Xpensed is a lightweight, database-free expense tracker. Its complete state is compressed into the URL, making the current budget easy to refresh, bookmark, or share without an account.

## Features

- Monthly income and savings target
- Dynamic expense rows with quantity and unit-cost calculations
- Completion tracking with actual and ideal expense totals
- Month-by-month rollovers with prior balance, accumulated overall balance, and accumulated savings
- Available and remaining budget totals
- Versioned, compressed link-based sharing
- Graceful handling of malformed or unsupported links
- Responsive table-to-card layout
- No database, backend, accounts, cookies, or browser storage

## How sharing works

Tracker values are validated, serialized into a compact structure, compressed, and written to a URL hash such as `#xsd:ENCODED_STATE`. The `xsd` format uses the current version 5 schema, while existing version 1 through version 5 links remain supported. The selected month, month lock, prior-month balance, accumulated overall balance, accumulated savings, and completion states are included in the link. Edits remain in memory until **Save as Link** is selected; saving replaces the current URL and copies it without creating extra browser-history entries.

Money is represented internally as integer centavos to avoid common floating-point addition errors. Version parsing and state validation are isolated from the user interface to support future migrations.

The link is the save file. Xpensed does not persist information on a server or device. Anyone who possesses the complete shared URL can decode and view the financial information in it, so only share links with people you trust.
