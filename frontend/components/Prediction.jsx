import {
	Box,
	Button,
	FormControl,
	FormHelperText,
	FormErrorMessage,
	FormLabel,
	Input,
} from '@chakra-ui/react';
import { Form, Formik, Field } from 'formik';

export default function Prediction() {
	function validateTeam(value) {
		let error;
		if (!value) {
			error = 'Team name is required';
		}

		return error;
	}

	function validateScore(value) {
		let error;
		if (!value) {
			error = 'Team score is required';
		} else if (value % 1 != 0) {
			error = 'Team score should be whole number';
		}

		return error;
	}

	return (
		<Box
			maxW={480}
			p={5}
		>
			<Formik
				initialValues={{
					homeTeam: 'Arsenal',
					awayTeam: 'Burnley',
					homeScore: 0,
					awayScore: 0,
				}}
				onSubmit={(values, actions) => {
					console.log('jere');
					setTimeout(() => {
						alert(JSON.stringify(values, null, 2));
						actions.setSubmitting(false);
					}, 1000);
				}}
			>
				{(props) => (
					<Form>
						<Field
							name='homeTeam'
							validate={validateTeam}
						>
							{({ field, form }) => (
								<FormControl isInvalid={form.errors.name && form.touched.name}>
									<FormLabel>Home Team</FormLabel>
									<Input
										{...field}
										placeholder='home team'
										isDisabled
									/>
									<FormErrorMessage>{form.errors.name}</FormErrorMessage>
								</FormControl>
							)}
						</Field>
						<Field
							name='awayTeam'
							validate={validateTeam}
						>
							{({ field, form }) => (
								<FormControl isInvalid={form.errors.name && form.touched.name}>
									<FormLabel>Away Team</FormLabel>
									<Input
										{...field}
										placeholder='away team'
										isDisabled
									/>
									<FormErrorMessage>{form.errors.name}</FormErrorMessage>
								</FormControl>
							)}
						</Field>
						<Field
							name='homeScore'
							validate={validateScore}
						>
							{({ field, form }) => (
								<FormControl isInvalid={form.errors.name && form.touched.name}>
									<FormLabel>Home Score</FormLabel>
									<Input
										{...field}
										placeholder='home score'
									/>
									<FormErrorMessage>{form.errors.name}</FormErrorMessage>
								</FormControl>
							)}
						</Field>
						<Field
							name='awayScore'
							validate={validateScore}
						>
							{({ field, form }) => (
								<FormControl isInvalid={form.errors.name && form.touched.name}>
									<FormLabel>Away Score</FormLabel>
									<Input
										{...field}
										placeholder='away score'
									/>
									<FormErrorMessage>{form.errors.name}</FormErrorMessage>
								</FormControl>
							)}
						</Field>
						<Button
							mt={4}
							colorScheme='teal'
							isLoading={props.isSubmitting}
							type='submit'
						>
							Submit
						</Button>
					</Form>
				)}
			</Formik>
		</Box>
	);
}
