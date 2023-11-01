import React, { useState, useEffect } from 'react';
import {
	Container,
	Box,
	Button,
	Table,
	Thead,
	Tbody,
	Tfoot,
	Tr,
	Th,
	Td,
	TableCaption,
	TableContainer,
	Spinner,
	Flex,
	Spacer,
	Heading,
	Text,
	Center,
	Link as ChakraLink,
} from '@chakra-ui/react';
import { useAccount, useContractRead } from 'wagmi';
import MeerkatCompetitionContract from '../artifacts/contracts/MeerkatCompetitionV1.sol/MeerkatCompetitionV1.json';
import { Link as ReactRouterLink } from 'react-router-dom';
import DeleteGame from './DeleteGame';
import { EditIcon } from '@chakra-ui/icons';

export default function CompetitionDashboard({ competitionAddress }) {
	const [games, setGames] = useState([]);

	const { address } = useAccount();
	const contractOwner = useContractRead({
		address: competitionAddress,
		abi: MeerkatCompetitionContract.abi,
		functionName: 'owner',
	});
	const { data } = useContractRead({
		address: competitionAddress,
		abi: MeerkatCompetitionContract.abi,
		functionName: 'getGames',
		watch: true,
	});

	useEffect(() => {
		const filteredGames = data.filter((g) => {
			return g.homeCompetitor && g.awayCompetitor;
		});
		setGames(filteredGames);
	}, [data]);

	function isOwner() {
		return address === contractOwner.data;
	}

	return (
		<Container
			maxWidth='container.xl'
			p={0}
		>
			<Flex
				pb={5}
				minWidth='max-content'
				alignItems='center'
				gap='2'
			>
				<Box px={5}>
					<Heading size='md'>Games</Heading>
				</Box>
				<Spacer />
				<Box p='2'>
					{isOwner() && (
						<Button
							colorScheme='teal'
							variant='outline'
						>
							<ReactRouterLink to='createGame'>Create Game</ReactRouterLink>
						</Button>
					)}
				</Box>
			</Flex>
			<TableContainer>
				<Table
					variant='striped'
					colorScheme='teal'
				>
					<Thead>
						<Tr>
							<Th>Start Time</Th>
							<Th>Home Team</Th>
							<Th></Th>
							<Th>Away Team</Th>
							<Th></Th>
						</Tr>
					</Thead>
					<Tbody>
						{games &&
							games
								.sort((g) => Number(g.startTime))
								.map((g, i) => {
									return (
										<Tr key={i}>
											<Th>{new Date(Number(g.startTime)).toLocaleString()}</Th>
											<Th>{g.homeCompetitor}</Th>
											<Th>
												<Flex>
													<Text
														fontSize='xl'
														textColor='teal'
													>
														(0)
													</Text>
													<Text
														fontSize='3xl'
														pl='5px'
													>
														{g.homeScore}
													</Text>

													<Text px='5px'>:</Text>
													<Text fontSize='3xl'>{g.awayScore}</Text>
													<Text
														pl='5px'
														fontSize='xl'
														textColor='teal'
													>
														(0)
													</Text>
												</Flex>
											</Th>
											<Th>{g.awayCompetitor}</Th>
											<Th>
												{isOwner() && (
													<Flex gap='2'>
														<Center
															bgColor='gray.100'
															borderRadius='md'
														>
															<ChakraLink
																as={ReactRouterLink}
																to={{ pathname: `updateGame/${g.id}` }}
																px='15px'
															>
																<EditIcon boxSize='5' />
															</ChakraLink>
														</Center>
														<DeleteGame
															competitionAddress={competitionAddress}
															gameId={g.id}
														/>
													</Flex>
												)}
											</Th>
										</Tr>
									);
								})}
					</Tbody>
				</Table>
			</TableContainer>
		</Container>
	);
}
