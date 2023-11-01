import { Formik, Field } from 'formik';
import React, { useState, useEffect } from 'react';
import {
	Box,
	Button,
	Flex,
	FormControl,
	FormLabel,
	FormErrorMessage,
	Input,
	VStack,
	Spinner,
	Text,
	Checkbox,
} from '@chakra-ui/react';

import { useNavigate, useParams } from 'react-router-dom';
import {
	useContractRead,
	useContractWrite,
	usePrepareContractWrite,
} from 'wagmi';
import MeerkatCompetitionContract from '../artifacts/contracts/MeerkatCompetitionV1.sol/MeerkatCompetitionV1.json';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function UpdateGame({ competitionAddress }) {
	const [args, setArgs] = useState([]);
	const [validationError, setValidationError] = useState(false);

	let navigate = useNavigate();
	let { id } = useParams();
	console.log('id', id, competitionAddress);
	const gameData = useContractRead({
		address: competitionAddress,
		abi: MeerkatCompetitionContract.abi,
		functionName: 'getGame',
		args: [id],
	});

	const { config, error } = usePrepareContractWrite({
		address: competitionAddress,
		abi: MeerkatCompetitionContract.abi,
		functionName: 'updateGame',
		args: args,
	});

	const { write, isSuccess } = useContractWrite(config);

	useEffect(() => {
		console.log('gameData', gameData);

		if (isSuccess) {
			navigate('/');
		}
	}, [isSuccess, gameData]);

	return (
		<Flex
			bg='gray.100'
			align='center'
			justify='center'
			h='50vh'
		>
			<Box
				bg='white'
				p={6}
				rounded='md'
				w={64}
			>
				<Formik
					initialValues={{
						gameId: Number(gameData.data?.id),
						home: gameData.data?.homeCompetitor,
						away: gameData.data?.awayCompetitor,
						startTime: new Date(Number(gameData.data?.startTime)),
						homeScore: gameData.data?.homeScore,
						awayScore: gameData.data?.awayScore,
						isFinalized: gameData.data?.isFinalized,
					}}
					onSubmit={(values) => {
						if (!values.home) {
						}
						console.log(values);
						setArgs([
							values.gameId,
							values.home,
							values.away,
							values.startTime.getTime(),
							values.homeScore,
							values.awayScore,
							values.isFinalized,
						]);
					}}
				>
					{({ handleSubmit, errors, touched }) => (
						<form onSubmit={handleSubmit}>
							<VStack
								spacing={4}
								align='flex-start'
							>
								<FormControl>
									<FormLabel htmlFor='gameId'>Game Id</FormLabel>
									<Field
										as={Input}
										id='gameId'
										name='gameId'
										type='text'
										variant='filled'
										isDisabled='true'
									/>
								</FormControl>
								<FormControl>
									<FormLabel htmlFor='home'>Home Competitor</FormLabel>
									<Field
										as={Input}
										id='home'
										name='home'
										type='text'
										variant='filled'
										validate={(value) => {
											let error;

											if (!value) {
												error = 'Home Competitor should not be empty';
											}

											return error;
										}}
									/>
									<FormErrorMessage>{errors.home}</FormErrorMessage>
								</FormControl>
								<FormControl>
									<FormLabel htmlFor='away'>Away Competitor</FormLabel>
									<Field
										as={Input}
										id='away'
										name='away'
										type='text'
										variant='filled'
										validate={(value) => {
											console.log('value:', value);
											let error;

											if (!value) {
												error = 'Away Competitor should not be empty';
											}

											return error;
										}}
									/>
									<FormErrorMessage>{errors.away}</FormErrorMessage>
								</FormControl>
								<FormControl>
									<FormLabel htmlFor='startTime'>Start Time</FormLabel>
									<Field name='startTime'>
										{({ field, form }) => {
											return (
												<DatePicker
													id='startTime'
													{...field}
													timeInputLabel='Time:'
													dateFormat='MM/dd/yyyy h:mm aa'
													showTimeInput
													placeholderText='Select start time'
													selected={field.value}
													onChange={(startTime) =>
														form.setFieldValue(field.name, startTime)
													}
												/>
											);
										}}
									</Field>
									<FormErrorMessage>{errors.startTime}</FormErrorMessage>
								</FormControl>
								<FormControl>
									<FormLabel htmlFor='homeScore'>Home Score</FormLabel>
									<Field
										as={Input}
										id='homeScore'
										name='homeScore'
										type='number'
										variant='filled'
										validate={(value) => {
											let error;

											if (!value) {
												error = 'Home Score should not be empty';
											}

											return error;
										}}
									/>
									<FormErrorMessage>{errors.homeScore}</FormErrorMessage>
								</FormControl>
								<FormControl>
									<FormLabel htmlFor='awayScore'>Home Score</FormLabel>
									<Field
										as={Input}
										id='awayScore'
										name='awayScore'
										type='number'
										variant='filled'
										validate={(value) => {
											let error;

											if (!value) {
												error = 'Home Score should not be empty';
											}

											return error;
										}}
									/>
									<FormErrorMessage>{errors.awayScore}</FormErrorMessage>
								</FormControl>
								<FormControl>
									<FormLabel htmlFor='isFinalized'>Is Finalized</FormLabel>
									<Field
										as={Checkbox}
										id='isFinalized'
										name='isFinalized'
										type='bool'
										variant='filled'
									/>
									<FormErrorMessage>{errors.isFinalized}</FormErrorMessage>
								</FormControl>
								<Button
									type='submit'
									colorScheme='purple'
									width='full'
								>
									Update
								</Button>
								<Button
									display={write ? '' : 'none'}
									onClick={() => {
										write();
									}}
									colorScheme='red'
									width='full'
								>
									Confirm
								</Button>
							</VStack>
						</form>
					)}
				</Formik>
			</Box>
		</Flex>
	);
}
