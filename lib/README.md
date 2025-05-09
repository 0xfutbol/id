# @0xfutbol/id

A React component library with shared providers for 0xFutbol ID.

## Installation

```bash
npm install @0xfutbol/id
# or
yarn add @0xfutbol/id
# or
pnpm add @0xfutbol/id
```

## Usage

### Basic Usage

```jsx
import { OxFutbolIdProvider } from '@0xfutbol/id';
import '@0xfutbol/id/css'; // Import CSS if needed

function App() {
  return (
    <OxFutbolIdProvider>
      <YourApp />
    </OxFutbolIdProvider>
  );
}
```

### Advanced Usage

```jsx
import { OxFutbolIdProvider } from '@0xfutbol/id';
import { QueryClient } from '@tanstack/react-query';
import '@0xfutbol/id/css';

// Create a custom QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Custom loading component
const LoadingSpinner = () => <div>Loading...</div>;

function App() {
  return (
    <OxFutbolIdProvider
      queryClient={queryClient}
      loadingComponent={<LoadingSpinner />}
      matchAppId="your-custom-app-id"
      matchWalletType="UserPasscode"
      thirdwebConfig={{
        // ThirdwebProvider configuration
        clientId: "your-client-id",
      }}
    >
      <YourApp />
    </OxFutbolIdProvider>
  );
}
```

## API Reference

### OxFutbolIdProvider

The main provider component that wraps your application.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | React.ReactNode | (required) | The content to be wrapped by the provider |
| `queryClient` | QueryClient | new QueryClient() | Custom QueryClient instance |
| `loadingComponent` | React.ReactNode | <LoadingScreen /> | Custom loading component |
| `matchAppId` | string | "pnh3wxqoqilsa1zy" | MatchProvider appId |
| `matchWalletType` | "Base" \| "UserPasscode" | "Base" | MatchProvider wallet type |
| `thirdwebConfig` | ThirdwebProviderProps | {} | ThirdwebProvider configuration |

## Peer Dependencies

This library has the following peer dependencies:

- React (^16.8.0 || ^17.0.0 || ^18.0.0)
- React DOM (^16.8.0 || ^17.0.0 || ^18.0.0)
- @tanstack/react-query (^4.0.0 || ^5.0.0)
- @rainbow-me/rainbowkit (^2.0.0) (optional)

## License

ISC 