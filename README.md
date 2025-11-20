# Sui Transaction Explainer

A beautiful, user-friendly web application that translates complex Sui blockchain transactions into plain, human-readable language. Simply paste a transaction digest or explorer link, and get a clear explanation of what happened, including object changes, transfers, gas usage, and smart contract calls.

![Sui Transaction Explainer](https://img.shields.io/badge/Sui-Transaction%20Explainer-4DA2FF?style=for-the-badge)

## ✨ Features

### Core Functionality
- **Transaction Parsing**: Fetch and parse any Sui transaction by digest
- **Human-Readable Summaries**: Clear explanations like "Alice sends 249.50 USDC to Bob"
- **Token Support**: Displays all token transfers (USDC, USDT, WETH, etc.) with real logos
- **NFT Recognition**: Automatically detects and displays NFTs with preview images
- **Object Tracking**: See all objects that were created, modified, transferred, or deleted
- **Gas Analytics**: Precise gas usage breakdown in SUI
- **Smart Contract Calls**: Identify which Move functions were called and from which packages

### User Experience
- **Flexible Input**: Accept transaction digests or full explorer URLs (SuiScan, SuiVision, Sui Explorer)
- **Visual Flow Diagrams**: See transfer flows with animated arrows showing sender → recipient
- **Token Icons**: Real token logos from CoinGecko for all major cryptocurrencies
- **NFT Previews**: Hover over NFTs to see images and metadata, click to open in explorer
- **Interactive Elements**: Clickable user addresses and objects that open in SuiScan
- **Modern UI**: Beautiful gradient design with glassmorphism effects
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Status**: Loading states and error handling for a smooth experience

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- A Sui RPC endpoint (defaults to Sui mainnet)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd explain
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm run dev
```

4. **Open your browser**
Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
npm run preview
```

## 📖 Usage

### Basic Usage

1. **Get a Transaction Digest**: Find any Sui transaction on an explorer or from your wallet
2. **Paste into the App**: Either paste the full URL or just the transaction digest
3. **Click "Explain"**: The app fetches and parses the transaction
4. **Read the Results**: Get a plain-language explanation of what happened

### Example Transactions

Try these real transactions from Sui mainnet:

```
# USDC Transfer (249.50 USDC)
AoLRL9ix8BY2AZYFpPPsXCkAAia3CqHCYoBwmFjBy8Bu

# NFT Creation (4 Swarm Network Agent NFTs)
2NbyGSNjmqqxC6tHTz49Rb6JXQ4hh2fC2LTvf7yUrgPh
```

Or paste any transaction hash or URL from SuiScan/Sui Explorer!

### Supported Explorer URLs

The app can extract transaction digests from:
- SuiScan: `https://suiscan.xyz/mainnet/tx/[digest]`
- SuiVision: `https://suivision.xyz/txblock/[digest]`
- Sui Explorer: `https://explorer.sui.io/txblock/[digest]`

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with custom Sui-themed colors
- **Icons**: Lucide React for beautiful, consistent icons
- **Blockchain**: @mysten/sui.js SDK for Sui blockchain interaction

### Project Structure

```
explain/
├── src/
│   ├── components/          # React components
│   │   ├── TransactionInput.tsx       # Input form for transaction digest
│   │   ├── TransactionDisplay.tsx     # Main display component
│   │   └── TransactionVisualization.tsx  # Flow visualization
│   ├── services/            # Business logic
│   │   └── suiService.ts    # Sui RPC client and parsers
│   ├── types/               # TypeScript type definitions
│   │   └── transaction.ts   # Transaction data structures
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # App entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

### Data Flow

1. **User Input** → User enters transaction digest
2. **RPC Fetch** → App calls Sui RPC via `@mysten/sui.js`
3. **Parsing** → Transaction data is parsed into structured format
4. **Summary Generation** → Human-readable summaries are generated
5. **Display** → Components render the parsed data with visualizations

For more architectural details, see [ARCHITECTURE.md](./ARCHITECTURE.md)

## 🔧 Configuration

### Switching Networks

By default, the app connects to Sui mainnet. To use testnet or devnet, edit `src/services/suiService.ts`:

```typescript
// Change 'mainnet' to 'testnet' or 'devnet'
const client = new SuiClient({ url: getFullnodeUrl('testnet') })
```

### Custom RPC Endpoint

To use a custom RPC endpoint:

```typescript
const client = new SuiClient({ url: 'https://your-custom-rpc.com' })
```

## 🎨 Customization

### Styling

The app uses Tailwind CSS with custom Sui colors defined in `tailwind.config.js`:

```javascript
colors: {
  'sui-blue': '#4DA2FF',
  'sui-dark': '#1A1B1F',
}
```

### Adding Features

The codebase is designed to be extensible:

- **New Summary Rules**: Add logic in `generateSummary()` in `suiService.ts`
- **Custom Visualizations**: Create new components in `src/components/`
- **Enhanced Parsing**: Extend the `parseTransaction()` function
- **Token Icons**: Add new token logos in `TokenIcon.tsx` (uses CoinGecko CDN)
- **Token Mappings**: Add token addresses in `suiService.ts` (see `TOKEN_MAPPINGS.md`)

## 🧪 Development

### Code Quality

```bash
# Type checking
npm run build

# Linting (if configured)
npm run lint
```

### Testing

Test the app with various transaction types:
- Simple SUI transfers
- NFT minting and transfers
- Complex DeFi transactions
- Failed transactions
- Transactions with many object changes

## 📊 API Reference

### SuiService

The main service for interacting with the Sui blockchain.

#### `fetchTransactionDetails(digest: string): Promise<ParsedTransaction>`

Fetches and parses a transaction by its digest.

**Parameters:**
- `digest` (string): The transaction digest hash

**Returns:**
- Promise resolving to a `ParsedTransaction` object

**Throws:**
- Error if transaction cannot be fetched or parsed

### Type Definitions

See `src/types/transaction.ts` for complete type definitions:

- `ParsedTransaction`: Main transaction data structure
- `ObjectChange`: Represents object creation, mutation, or deletion
- `TransferChange`: Represents object transfers
- `PackageCall`: Represents smart contract function calls

## 🤝 Contributing

Contributions are welcome! Here are some ideas:

- Add support for more transaction types
- Improve summary generation with more patterns
- Add transaction comparison features
- Create shareable transaction reports
- Add transaction history tracking

## 📝 License

MIT License - feel free to use this project for any purpose.

## 🔗 Resources

- [Sui Documentation](https://docs.sui.io/)
- [Sui TypeScript SDK](https://github.com/MystenLabs/sui/tree/main/sdk/typescript)
- [Sui Explorer](https://explorer.sui.io/)
- [SuiScan](https://suiscan.xyz/)

## 🐛 Troubleshooting

### Common Issues

**"Failed to fetch transaction"**
- Check that the transaction digest is valid
- Ensure you have internet connectivity
- Verify the RPC endpoint is accessible

**Slow Loading**
- Some transactions with many operations may take longer to parse
- Consider implementing caching for repeated queries

**Type Errors**
- Sui transaction structures may vary; the parser handles most common cases
- Unknown object types will display as "Object"

## 📧 Support

For questions or issues, please open a GitHub issue or reach out to the maintainers.

---

Built with ❤️ for the Sui community

