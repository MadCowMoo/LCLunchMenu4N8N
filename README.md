# LC Lunch Menu for n8n

[![npm version](https://badge.fury.io/js/n8n-nodes-lclunchmenu.svg)](https://badge.fury.io/js/n8n-nodes-lclunchmenu)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An n8n node to interact with the Linq Connect Lunch Menu API, allowing you to retrieve and filter lunch menu information directly in your n8n workflows.

## Features

- Retrieve lunch menu information by date range
- Filter by main entrees or lunch menu only
- Configurable district and building IDs
- TypeScript support
- Configurable logging for debugging

## Installation

### In n8n

1. Go to **Settings** > **Community Nodes**
2. Click on **Install**
3. Enter the npm package name: `n8n-nodes-lclunchmenu`
4. Click **Install**

### Manual Installation

1. In your n8n root directory, run:
   ```bash
   npm install n8n-nodes-lclunchmenu
   ```
2. Restart n8n

## Logging Configuration

The node includes configurable logging to help with debugging. By default, it logs at the 'info' level and above.

### Log Levels

Available log levels (in order of increasing severity):
- `debug`: Most verbose, shows all messages
- `info`: Default level, shows info, warnings, and errors
- `warn`: Shows only warnings and errors
- `error`: Shows only errors
- `silent`: No logging

### Configuration

You can set the log level using the `LC_LUNCH_MENU_LOG_LEVEL` environment variable:

```bash
# Set log level via environment variable
export LC_LUNCH_MENU_LOG_LEVEL=debug

# Or when running n8n directly
LC_LUNCH_MENU_LOG_LEVEL=debug n8n start
```

### Example Output

```
[DEBUG] Fetching menu data { params: {...} }
[INFO] Successfully retrieved menu data
[WARN] Some items were filtered out
[ERROR] Failed to fetch menu data: Network Error
```

## Usage

### Node Configuration

1. Add the **LC Lunch Menu** node to your workflow
2. Configure the following parameters:
   - **Operation**: Choose between:
     - `Get Menu`: Retrieves menu for a date range
     - `Get Menu For Date`: Retrieves menu for a specific date
   - **District ID**: Your school district ID
   - **Building ID**: Your school building ID
   - **Target Date**: (For 'Get Menu For Date' operation) The date to retrieve menu for
   - **Main Entrees Only**: Check to filter for main entrees only
   - **Lunch Only**: Check to filter for lunch menu items only

### Output Format

The node returns an array of menu days, each containing:

```typescript
{
  date: string;           // Date in YYYY-MM-DD format
  menuName: string;       // Name of the menu (e.g., 'Lunch')
  items: MenuItem[];      // Array of menu items
}

interface MenuItem {
  categoryName: string;   // Category name (e.g., 'Entree', 'Side')
  foodName: string;       // Name of the food item
  menuName: string;       // Name of the menu this item belongs to
}

## Credentials

For future use, the following credentials are defined but not currently used:

- **API Key**: For authenticating with the LC Lunch Menu API
- **Base URL**: The base URL for the API (default: 'https://api.lclunchmenu.com/v1')

These can be configured in n8n under **Credentials** > **LC Lunch Menu API** if needed in the future.

## Development

### Prerequisites

- Node.js (v16 or later)
- npm (v8 or later)
- n8n (for testing)

### Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/LCLunchMenu4N8N.git
   cd LCLunchMenu4N8N
   ```

2. Install dependencies
   ```bash
   npm install
   ```

### Building and Testing

```bash
# Build the project
npm run build

# Run tests
npm test

# Run in development mode with file watching
npm run dev
```

### Environment Variables

- `LC_LUNCH_MENU_LOG_LEVEL`: Set the logging level (debug, info, warn, error, silent)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

For support, please open an issue on the [GitHub repository](https://github.com/yourusername/LCLunchMenu4N8N/issues).
