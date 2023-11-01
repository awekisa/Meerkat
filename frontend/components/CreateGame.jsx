import { Formik, Field } from 'formik';
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
} from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useContractWrite, usePrepareContractWrite } from 'wagmi';
import MeerkatCompetitionContract from '../artifacts/contracts/MeerkatCompetitionV1.sol/MeerkatCompetitionV1.json';

export default function CreateGame({ competitionAddress }) {
	const [args, setArgs] = useState([]);
	const [validationError, setValidationError] = useState(false);

	let navigate = useNavigate();

	const { config, error } = usePrepareContractWrite({
		address: competitionAddress,
		abi: MeerkatCompetitionContract.abi,
		functionName: 'addGame',
		args: args,
	});

	const { write, isSuccess } = useContractWrite(config);

	useEffect(() => {
		if (isSuccess) {
			navigate('/');
		}
	}, [isSuccess]);

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
						home: 'Villa',
						away: 'Everton2',
						startTime: '',
					}}
					onSubmit={(values) => {
						if (!values.home) {
						}
						console.log(values);
						setArgs([values.home, values.away, values.startTime.getTime()]);
					}}
				>
					{({ handleSubmit, errors, touched }) => (
						<form onSubmit={handleSubmit}>
							<VStack
								spacing={4}
								align='flex-start'
							>
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
								<Button
									type='submit'
									colorScheme='purple'
									width='full'
								>
									Create
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
