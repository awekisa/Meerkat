import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Prediction from './Prediction';

export default function App() {
	return (
		<HashRouter>
			<Routes>
				<Route
					path='/'
					element={<Home />}
				/>
				<Route
					path='prediction/'
					element={<Prediction />}
				/>
			</Routes>
		</HashRouter>
	);
}
