import {
	Box,
	Button,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalCloseButton,
	ModalBody,
	ModalFooter,
	useDisclosure,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContractWrite, usePrepareContractWrite } from 'wagmi';
import MeerkatCompetitionContract from '../artifacts/contracts/MeerkatCompetitionV1.sol/MeerkatCompetitionV1.json';

export default function DeleteGame({ competitionAddress, gameId }) {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const finalRef = React.useRef(null);

	const { config, error } = usePrepareContractWrite({
		address: competitionAddress,
		abi: MeerkatCompetitionContract.abi,
		functionName: 'deleteGame',
		args: [gameId],
	});

	const { write, isSuccess } = useContractWrite(config);

	let navigate = useNavigate();

	useEffect(() => {
		if (isSuccess) {
			navigate('/');
		}
	}, [isSuccess]);

	return (
		<>
			<Button onClick={onOpen}>
				<DeleteIcon />
			</Button>
			<Modal
				finalFocusRef={finalRef}
				isOpen={isOpen}
				onClose={onClose}
			>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Delete Game</ModalHeader>
					<ModalCloseButton />
					<ModalBody>Are you sure you want to delete the game?</ModalBody>

					<ModalFooter>
						<Button
							colorScheme='blue'
							mr={3}
							onClick={onClose}
						>
							Close
						</Button>
						<Button
							variant='ghost'
							onClick={write}
						>
							Delete
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
}
