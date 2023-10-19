import { Card, Box, HStack, Spacer } from '@chakra-ui/react';
import { ViewIcon } from '@chakra-ui/icons';
import { Link } from 'react-router-dom';

export default function GameCard({ game }) {
	return (
		<Card
			p={5}
			bg='teal.500'
		>
			<Box
				textColor='white'
				textAlign='center'
				pb={5}
			>
				<p>Crap timestamp (fix!) {game.startTime.toString()}</p>
			</Box>
			<HStack justifyItems='fill'>
				<Box textColor='white'>{game.homeCompetitor}</Box>
				<Spacer />
				<Box textColor='white'>{game.homeScore}</Box>
				<Box textColor='white'>{game.awayScore}</Box>
				<Spacer />
				<Box textColor='white'>{game.awayCompetitor}</Box>
			</HStack>
			<HStack
				textColor='white'
				pt={5}
			>
				<Spacer />
				<ViewIcon />
				<Link to='prediction/'>Predict</Link>
				<Spacer />
			</HStack>
		</Card>
	);
}
