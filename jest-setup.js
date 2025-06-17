// jest-setup.js
import 'react-native-gesture-handler/jestSetup';

// Mock pour expo-router
jest.mock('expo-router', () => ({
    router: {
        push: jest.fn(),
        back: jest.fn(),
        replace: jest.fn(),
    },
    useRouter: () => ({
        push: jest.fn(),
        back: jest.fn(),
        replace: jest.fn(),
    }),
    useGlobalSearchParams: () => ({}),
}));

// Mock pour twrnc
jest.mock('twrnc', () => ({
    __esModule: true,
    default: {
        color: jest.fn(() => '#000000'),
    },
}));

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');