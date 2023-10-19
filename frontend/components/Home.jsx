import React, { useState, useEffect } from 'react';
import {
	Container,
	Flex,
	VStack,
	Input,
	Box,
	Spacer,
	HStack,
	SimpleGrid,
	List,
	Text,
	Spinner,
} from '@chakra-ui/react';
import { useAccount, useContractRead } from 'wagmi';
import MeerkatCompetitionContract from '../artifacts/contracts/MeerkatCompetitionV1.sol/MeerkatCompetitionV1.json';
import GameCard from './GameCard';

export default function Home() {
	const competitionAddress = '0x32BE706cD0cfc57B558eC8dCA3b44cA7F3ca75e2';
	const { data, isLoading, isError, status } = useContractRead({
		address: competitionAddress,
		abi: MeerkatCompetitionContract.abi,
		functionName: 'getGames',
	});

	const result = useContractRead({
		address: '0x32BE706cD0cfc57B558eC8dCA3b44cA7F3ca75e2',
		abi: MeerkatCompetitionContract.abi,
		functionName: 'owner',
	});

	const { address, isConnecting, isDisconnected } = useAccount();

	useEffect(() => {}, [data, isLoading, isError, status]);

	return (
		<Container
			maxWidth='container.xl'
			p={0}
		>
			{data ? (
				<SimpleGrid
					minChildWidth={300}
					px={10}
					spacing={10}
				>
					{data.map((g, i) => {
						return (
							<GameCard
								game={g}
								key={i}
							/>
						);
					})}
				</SimpleGrid>
			) : (
				<Spinner />
			)}
		</Container>
	);
}
