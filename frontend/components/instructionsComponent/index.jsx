import styles from './instructionsComponent.module.css';
import { ChakraProvider } from '@chakra-ui/react';
import App from '../../components/App';

export default function InstructionsComponent() {
	return (
		<ChakraProvider>
			<App />
		</ChakraProvider>
	);
}
