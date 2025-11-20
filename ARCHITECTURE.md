# Architecture Documentation

## Overview

The Sui Transaction Explainer is a client-side web application built with React and TypeScript that interfaces with the Sui blockchain to fetch, parse, and display transaction data in a user-friendly format.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│  ┌─────────────────┐  ┌──────────────────────────────────┐  │
│  │ Transaction     │  │  Transaction Display              │  │
│  │ Input Component │  │  - Overview Card                  │  │
│  │                 │  │  - Summary Section                │  │
│  └────────┬────────┘  │  - Visualization                  │  │
│           │           │  - Object Changes Grid            │  │
│           │           └──────────────────────────────────┘  │
└───────────┼─────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  App.tsx (State Management)                          │   │
│  │  - Transaction State                                 │   │
│  │  - Loading State                                     │   │
│  │  - Error Handling                                    │   │
│  └────────────────────┬─────────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  suiService.ts                                       │   │
│  │  - fetchTransactionDetails()                         │   │
│  │  - parseTransaction()                                │   │
│  │  - generateSummary()                                 │   │
│  │  - formatOwner()                                     │   │
│  │  - extractTypeName()                                 │   │
│  └────────────────────┬─────────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Sui Blockchain Layer                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  @mysten/sui.js SDK                                  │   │
│  │  - SuiClient                                         │   │
│  │  - RPC Methods                                       │   │
│  └────────────────────┬─────────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │  Sui RPC    │
                   │  Endpoint   │
                   └─────────────┘
```

## Core Components

### 1. User Interface Layer

#### TransactionInput Component
- **Purpose**: Accepts transaction digest or explorer URL from user
- **Features**:
  - URL parsing to extract digest from explorer links
  - Input validation
  - Loading state display
  - Helpful placeholder text and tips
- **Key Functions**:
  - `handleSubmit()`: Processes input and triggers fetch

#### TransactionDisplay Component
- **Purpose**: Displays parsed transaction data
- **Sections**:
  - **Overview Card**: Status, sender, gas, timestamp
  - **Summary Section**: Human-readable bullet points
  - **Package Calls**: Smart contract functions called
  - **Object Changes Grid**: Created, mutated, transferred, deleted objects
- **Key Functions**:
  - `formatTimestamp()`: Converts Unix timestamp to readable date

#### TransactionVisualization Component
- **Purpose**: Visual representation of object transfers
- **Features**:
  - Sender and recipient boxes
  - Animated arrows showing flow
  - Object type labels
  - Color coding (purple for sender, green for recipient)
- **Limitations**: Shows max 5 transfers for clarity

### 2. Application Layer

#### App.tsx
- **Purpose**: Main application container and state manager
- **State Management**:
  ```typescript
  const [transaction, setTransaction] = useState<ParsedTransaction | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  ```
- **Key Functions**:
  - `handleFetchTransaction()`: Orchestrates transaction fetching and error handling

### 3. Service Layer

#### suiService.ts

The core business logic for interacting with Sui blockchain.

##### SuiClient Initialization
```typescript
const client = new SuiClient({ url: getFullnodeUrl('mainnet') })
```
- Creates client instance connected to Sui mainnet
- Can be configured for testnet, devnet, or custom RPC

##### fetchTransactionDetails()
```typescript
async function fetchTransactionDetails(digest: string): Promise<ParsedTransaction>
```
- **Purpose**: Fetches raw transaction data from Sui RPC
- **RPC Options**:
  - `showInput`: Transaction input data
  - `showEffects`: Transaction effects (gas, status, etc.)
  - `showEvents`: Events emitted
  - `showObjectChanges`: Object creation/mutation/deletion
  - `showBalanceChanges`: Balance changes (SUI transfers)
- **Error Handling**: Catches and wraps errors with descriptive messages

##### parseTransaction()
```typescript
function parseTransaction(txBlock: any): ParsedTransaction
```
- **Purpose**: Transforms raw RPC response into structured, typed data
- **Parsing Steps**:
  1. Extract sender address
  2. Calculate gas costs
  3. Categorize object changes (created, deleted, mutated, transferred)
  4. Extract package/module calls
  5. Generate human-readable summary
- **Return**: `ParsedTransaction` object

##### generateSummary()
```typescript
function generateSummary(data: any): string[]
```
- **Purpose**: Creates human-readable bullet points
- **Summary Rules**:
  - Transaction initiator
  - Function calls
  - Object creations (with types)
  - Object transfers (from → to)
  - Object mutations
  - Object deletions
  - Balance changes (SUI transfers)
- **Smart Type Detection**: Identifies NFTs, Coins, and other object types

##### Helper Functions

**formatOwner(owner: any): string**
- Converts various owner formats to readable strings
- Handles: AddressOwner, ObjectOwner, Shared, Immutable
- Truncates long addresses

**truncateAddress(address: string): string**
- Formats addresses as `0x1234...5678`
- Makes UI more readable

**extractTypeName(fullType: string): string**
- Parses full Move type paths
- Extracts simple type names (e.g., "NFT", "Coin", "SUI Coin")
- Handles generics and nested types

## Data Structures

### ParsedTransaction
```typescript
interface ParsedTransaction {
  digest: string              // Transaction hash
  timestamp?: number          // Unix timestamp
  sender: string              // Sender address
  success: boolean            // Transaction status
  gasUsed: string            // Gas in MIST
  gasCostSui: string         // Gas in SUI (human-readable)
  objectsCreated: ObjectChange[]
  objectsDeleted: ObjectChange[]
  objectsMutated: ObjectChange[]
  objectsTransferred: TransferChange[]
  packageCalls: PackageCall[]
  summary: string[]          // Human-readable summary
  rawEffects?: unknown       // Raw RPC response (for debugging)
}
```

### ObjectChange
```typescript
interface ObjectChange {
  objectId: string           // Unique object ID
  objectType: string         // Full Move type path
  version?: string           // Object version
  digest?: string            // Object digest
  owner?: string             // Object owner (if applicable)
}
```

### TransferChange
```typescript
interface TransferChange {
  objectId: string
  objectType: string
  from: string               // Sender address
  to: string                 // Recipient address
  version?: string
}
```

### PackageCall
```typescript
interface PackageCall {
  package: string            // Package address
  module: string             // Module name
  function: string           // Function name
  displayName: string        // Formatted as "module::function"
}
```

## Data Flow

### Transaction Fetch Flow

1. **User Input**
   - User enters digest or URL
   - Input component validates and extracts digest

2. **State Update**
   - App sets loading state to true
   - Previous transaction/error cleared

3. **RPC Request**
   - `fetchTransactionDetails()` called with digest
   - `SuiClient.getTransactionBlock()` queries Sui RPC
   - Request includes all options (effects, changes, events)

4. **Response Parsing**
   - Raw transaction data received
   - `parseTransaction()` transforms data
   - Object changes categorized
   - Summary generated

5. **UI Update**
   - Parsed transaction set in state
   - Loading state cleared
   - Components re-render with new data

6. **Error Handling**
   - Errors caught at service layer
   - Error message set in state
   - Error UI displayed to user

### Object Change Processing

```
Raw RPC ObjectChange → parseTransaction() → Categorization
                                             ↓
                        ┌────────────────────┼────────────────────┐
                        ↓                    ↓                    ↓
                   Created              Mutated           Transferred
                        ↓                    ↓                    ↓
                  ObjectChange         ObjectChange        TransferChange
                        ↓                    ↓                    ↓
                  Display in           Display in          Visualization
                  Green Card          Yellow Card          + Blue Card
```

## Design Patterns

### 1. Service Layer Pattern
- Business logic separated from UI components
- Single responsibility: `suiService.ts` handles all blockchain interactions
- Easy to test and mock

### 2. Component Composition
- Small, focused components
- Props-based communication
- Reusable and maintainable

### 3. Type Safety
- Comprehensive TypeScript interfaces
- Type checking at compile time
- IntelliSense support in IDEs

### 4. Error Boundaries
- Try-catch blocks in async functions
- Error state propagated to UI
- User-friendly error messages

### 5. Loading States
- Explicit loading state management
- Disabled inputs during loading
- Loading indicators for better UX

## Styling Architecture

### Tailwind CSS Utility-First
- No custom CSS classes needed
- Consistent design tokens
- Responsive by default

### Glassmorphism Design
```css
bg-white/10 backdrop-blur-md border border-white/20
```
- Semi-transparent backgrounds
- Blur effects
- Modern, premium look

### Color System
- **Primary**: `sui-blue` (#4DA2FF) - Sui brand color
- **Success**: Green (created, received)
- **Warning**: Yellow (mutated)
- **Error**: Red (deleted, failed)
- **Info**: Blue (transfers)
- **Neutral**: Purple (sender)

### Responsive Grid
```css
grid-cols-1 md:grid-cols-2 lg:grid-cols-3
```
- Mobile-first approach
- Breakpoints for tablet and desktop

## Performance Considerations

### 1. Lazy Loading
- Components render only when data available
- Conditional rendering with `&&` operator

### 2. Truncation
- Long addresses truncated
- Object lists scrollable with max height
- Transfer visualization limited to 5 items

### 3. Efficient State Updates
- Single state object per transaction
- No unnecessary re-renders
- React.StrictMode for development checks

### 4. Bundle Size
- Vite for tree-shaking
- Production builds optimized
- Tailwind CSS purges unused styles

## Security Considerations

### 1. Read-Only Operations
- No private key handling
- No transaction signing
- Only reads public blockchain data

### 2. Input Validation
- User input sanitized
- URL parsing extracts digest safely
- Invalid digests caught by RPC

### 3. Error Handling
- No sensitive data in error messages
- Graceful degradation
- User-friendly error display

## Extensibility

### Adding New Transaction Types

1. Update `generateSummary()` with new patterns:
```typescript
if (objectType.includes('MyNewType')) {
  summary.push('Custom summary for MyNewType')
}
```

2. Add type detection in `extractTypeName()`:
```typescript
if (fullType.includes('MyNewType')) {
  return 'My New Type'
}
```

### Adding New Visualizations

1. Create new component in `src/components/`
2. Import in `TransactionDisplay.tsx`
3. Conditionally render based on transaction data

### Supporting Custom RPC Endpoints

1. Add environment variable support
2. Create configuration file
3. Update `SuiClient` initialization:
```typescript
const rpcUrl = import.meta.env.VITE_SUI_RPC_URL || getFullnodeUrl('mainnet')
const client = new SuiClient({ url: rpcUrl })
```

## Testing Strategy

### Unit Tests (Recommended)
- Test `parseTransaction()` with mock data
- Test `generateSummary()` with various scenarios
- Test helper functions (formatOwner, truncateAddress, extractTypeName)

### Integration Tests (Recommended)
- Test `fetchTransactionDetails()` with real RPC
- Test component rendering with parsed data
- Test error handling with invalid digests

### E2E Tests (Recommended)
- Test full user flow: input → fetch → display
- Test URL parsing
- Test different transaction types

## Deployment

### Build for Production
```bash
npm run build
```
- Outputs to `dist/` directory
- Optimized and minified
- Ready for static hosting

### Hosting Options
- **Vercel**: Zero-config deployment
- **Netlify**: Drag-and-drop deploy
- **GitHub Pages**: Free static hosting
- **AWS S3 + CloudFront**: Scalable solution
- **IPFS**: Decentralized hosting

### Environment Variables (Optional)
```env
VITE_SUI_RPC_URL=https://custom-rpc.sui.io
```

## Future Enhancements

### Planned Features
1. **Transaction Comparison**: Compare two transactions side-by-side
2. **History Tracking**: Save and view recently explained transactions
3. **Export Reports**: Download transaction summaries as PDF/JSON
4. **Deep Linking**: Share specific transaction views via URL params
5. **Advanced Filtering**: Filter object changes by type
6. **Event Display**: Show emitted events with details
7. **Batch Processing**: Explain multiple transactions at once
8. **Caching**: Cache transaction data for faster repeat views

### Technical Improvements
1. **State Management**: Consider Zustand/Redux for complex state
2. **API Layer**: Abstract RPC client for easier testing
3. **WebSocket Support**: Real-time transaction updates
4. **Progressive Web App**: Offline support and installability
5. **Analytics**: Track popular transaction types
6. **Internationalization**: Multi-language support

## Conclusion

The Sui Transaction Explainer is architected for simplicity, maintainability, and extensibility. The clear separation of concerns, comprehensive type safety, and modern React patterns make it easy to understand, modify, and extend.

For questions or suggestions, please refer to the main README.md or open an issue on GitHub.

