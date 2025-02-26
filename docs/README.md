# Unstructured Specification App

## Overview

This project handles the SKU specifications for VTEX Unstructured Specifications. The main features include specification bulk import, specification bulk export, and checking the progress of ongoing imports.

## Main Features

### 1. Specification Bulk Import

**Location in Code:**

- `/node/middlewares/receive-file.ts`
- `/node/middlewares/process-file.ts`
- `/node/api/specifications-api.ts`
- `/react/MainPage.tsx`

**Flow of Code:**

1. The request to import specifications in bulk is received by the `receiveFile` middleware.
2. The `receiveFile` validates the uploaded XLSX file.
3. The `receiveFile` sends to the `process-file` middleware to process each line.
4. The `process-file` processes the file sends an API request creating or updating every specification row.
5. The progress is is updated every `UPDATE_PROGRESS_INTERVAL_PERCENTAGE` (default is 5).

### 2. Specification Bulk Export

**Location in Code:**

- `/node/middlewares/brand-list.ts`
- `/node/middlewares/report.ts`
- `/node/clients/janus-client.ts`
- `/react/ExportPage.tsx`

**Flow of Code:**

1. The `brand-list middleware` is called to provide the list o brands in order to select one.
2. After selecting a brand, the `report` middleware will export every sku specification from very sku with this brand.
3. The response containing all information is passed to react frontend where it is processed and joined in a xlsx file and downloaded.

### 3. Checking Progress of Ongoing Imports

**Location in Code:**

- `/node/middlewares/progress-info.ts`
- `/node/clients/janus-client.ts`
- `/node/middlewares/DetailsPage.tsx`

**Flow of Code:**

1. The request to check the progress of ongoing imports is received by the `progress-info` middleware.
2. The `progress-info` gets the progress information from a masterdata document.
3. The progress is sent back to frontend and rendered to the user.

### 4. Status check

**Location in Code:**

- `/node/middlewares/status.ts`
- `/node/clients/status.ts`

**Flow of Code:**

1. Feature to implement the healthcheck of the application.

## Additional Information

### Useful docs

- [Masterdata basics](https://developers.vtex.com/docs/guides/master-data-v2-basics)
- [VTEX Custom clients](https://developers.vtex.com/docs/guides/vtex-io-documentation-how-to-create-and-use-clients)
- [VTEX APIs](https://developers.vtex.com/docs/api-reference)
- [Admin Example Boilerplate](https://github.com/vtex-apps/admin-example)
- [async busboy](https://github.com/m4nuC/async-busboy#readme)

### Contributions

Feel free to submit a PR if you find any issues or improvements. If you need a specific use case, feel free to create your own fork.
