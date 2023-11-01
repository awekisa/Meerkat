import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Prediction from './Prediction';
import CreateGame from './CreateGame';
import UpdateGame from './UpdateGame';

export default function App() {
	const competitionAddress = '0x32BE706cD0cfc57B558eC8dCA3b44cA7F3ca75e2';

	return (
		<HashRouter>
			<Routes>
				<Route
					path='/'
					element={<Home competitionAddress={competitionAddress} />}
				/>
				<Route
					path='prediction/'
					element={<Prediction />}
				/>
				<Route
					path='createGame'
					element={<CreateGame competitionAddress={competitionAddress} />}
				/>
				<Route
					path='updateGame/:id'
					element={<UpdateGame competitionAddress={competitionAddress} />}
				/>
			</Routes>
		</HashRouter>
	);
}
