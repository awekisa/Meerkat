'use client';

import { ConnectKitButton } from 'connectkit';
import styles from './Navbar.module.css';
import { useAccount } from 'wagmi';

export default function Navbar() {
	const { address } = useAccount();

	return (
		<nav className={styles.navbar}>
			<h1>Meerkat</h1>
			{address === '0x32BE706cD0cfc57B558eC8dCA3b44cA7F3ca75e2' ?? <AddGame />}
			<ConnectKitButton />
		</nav>
	);
}
