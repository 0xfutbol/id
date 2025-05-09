# Next.js & NextUI Template

This is a template for creating applications using Next.js 14 (app directory) and NextUI (v2).

[Try it on CodeSandbox](https://githubbox.com/nextui-org/metasoccer-id)

## Technologies Used

- [Next.js 14](https://nextjs.org/docs/getting-started)
- [NextUI v2](https://nextui.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Tailwind Variants](https://tailwind-variants.org)
- [TypeScript](https://www.typescriptlang.org/)
- [Framer Motion](https://www.framer.com/motion/)
- [next-themes](https://github.com/pacocoursey/next-themes)

## How to Use

### Use the template with create-next-app

To create a new project based on this template using `create-next-app`, run the following command:

```bash
npx create-next-app -e https://github.com/nextui-org/metasoccer-id
```

### Install dependencies

You can use one of them `npm`, `yarn`, `pnpm`, `bun`, Example using `npm`:

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

### Setup pnpm (optional)

If you are using `pnpm`, you need to add the following code to your `.npmrc` file:

```bash
public-hoist-pattern[]=*@nextui-org/*
```

After modifying the `.npmrc` file, you need to run `pnpm install` again to ensure that the dependencies are installed correctly.

## License

Licensed under the [MIT license](https://github.com/nextui-org/metasoccer-id/blob/main/LICENSE).

## Redux State Management

This project uses Redux Toolkit for state management with the following structure:

### Store Organization

- `/store`: Main Redux store setup
  - `index.ts`: Store configuration and exports
  - `hooks.ts`: Typed Redux hooks
  - `/features`: Feature-based slices
    - `/user`: User-related state
      - `index.ts`: Feature exports
      - `userSlice.ts`: User slice with actions, reducers, and selectors

### Usage in Components

```tsx
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  fetchUserProfile, 
  selectUser 
} from '@/store/features/user';

function MyComponent() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  
  // Use dispatch with actions
  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);
  
  // Use selectors to access state
  if (user) {
    return <div>Hello, {user.username}!</div>;
  }
  
  return <div>Loading...</div>;
}
```

### Adding New Features

To add a new feature:

1. Create a new directory in `/store/features`
2. Create a slice file with actions, reducers, and selectors
3. Create an index.ts file to export the slice
4. Add the reducer to the root reducer in `/store/index.ts`
