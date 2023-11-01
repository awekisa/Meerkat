import {
	Table,
	Thead,
	Tbody,
	Tfoot,
	Tr,
	Th,
	Td,
	TableCaption,
	TableContainer,
} from '@chakra-ui/react';

export default function CompetitionCard({ competition }) {
	return (
		<TableContainer>
			<Table
				variant='stripped'
				colorScheme='teal'
			>
				<TableCaption />
				<Thead>
					<Tr>
						<Th>Created at</Th>
						<Th>Name</Th>
						<Th>Address</Th>
						<Th>Owner</Th>
					</Tr>
				</Thead>
				<Tbody>
					<Tr>
						<Td>{new Date(Number(competition.timestamp)).toLocaleString()}</Td>
						<Td>{competition.name}</Td>
						<Td textOverflow={scroll}>{competition.competitionAddress}</Td>
						<Td textOverflow={scroll}>{competition.competitionOwner}</Td>
					</Tr>
				</Tbody>
			</Table>
		</TableContainer>
	);
}
