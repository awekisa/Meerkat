import * as react from '@chakra-ui/react';
import CompetitionDashboard from './CompetitionDashboard';

export default function Home({ competitionAddress }) {
	return (
		<react.Container
			maxWidth='container.xl'
			p={0}
		>
			<CompetitionDashboard competitionAddress={competitionAddress} />
		</react.Container>
	);
}
