'use client';
import { WagmiConfig, createConfig } from 'wagmi';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';
import Navbar from '../components/instructionsComponent/navigation/navbar';
import Footer from '../components/instructionsComponent/navigation/footer';
import { mainnet, sepolia } from 'wagmi/chains';

const config = createConfig(
	getDefaultConfig({
		// Required API Keys
		alchemyId: process.env.REACT_APP_ALCHEMY_API_KEY, // or infuraId
		walletConnectProjectId: '31a18ca4eae2b5ce010e299d9fac315b',

		// Required
		appName: 'You Create Web3 Dapp',

		chains: [mainnet, sepolia],
		// Optional
		appDescription: 'Your App Description',
		appUrl: 'https://family.co', // your app's url
		appIcon: 'https://family.co/logo.png', // your app's logo,no bigger than 1024x1024px (max. 1MB)
	})
);

export default function RootLayout({ children }) {
	return (
		<html lang='en'>
			<WagmiConfig config={config}>
				<ConnectKitProvider mode='dark'>
					<body>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								minHeight: '105vh',
							}}
						>
							<Navbar />
							<div style={{ flexGrow: 1 }}>{children}</div>
							<Footer />
						</div>
					</body>
				</ConnectKitProvider>
			</WagmiConfig>
		</html>
	);
}
