import { Button, FormControl, FormHelperText, InputAdornment, InputLabel, Link, OutlinedInput, TextField, Typography } from "@mui/material";
import {
	createUserWithEmailAndPassword as createUser,
	getAuth,
	updateProfile
} from "firebase/auth";
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import { useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { PasswordField } from "../../components";

import { useCallback } from "react";
import { Colllections } from "../../helper/firebase";
import { putEventTargetValue } from '../../helper/short-functions';
import AuthLayout from "./AuthLayout";

const CustomErrorCodes = {
	PASS_NOT_MATCH: 'pass_not_match',
	INVALID_CREDENTIALS: 'invalid_credentials',
	INVALID_REGISTRY: 'invalid_registry'
}

export default function Register({ onCreateUser }) {
	const [ name, setName ] = useState('')
	const [ registry, setRegistry ] = useState('')
	const [ email, setEmail ] = useState('')
	const [ password, setPassword ] = useState('')
	const [ passwordConfirmation, setPasswordConfirmation ] = useState('')

	const { state } = useLocation()
	const navigate = useNavigate()

	const [ showPassword, setShowPassword ] = useState(false)

	const [ error, setError ] = useState()
	const checkErrorCode = useCallback(customError => error?.code === customError, [error])

	const singUp = () => {
		const filledEmail = email + '@gsuite.iff.edu.br'
		let error

		async function trySingUp() {
			if (password !== passwordConfirmation) {
				error = { message: 'senhas não conferem', code: CustomErrorCodes.PASS_NOT_MATCH }
				throw error
			}

			let user
			try {
				user = await createUser(getAuth(), filledEmail, password).then(({ user }) => user)
			} catch (err) {
				error = {
					message: 'email já cadastrado',
					code: CustomErrorCodes.INVALID_CREDENTIALS,
					firebaseCode: err.code
				}
				throw error
			}
			
			await setDoc(doc(getFirestore(), Colllections.USERS, user.uid), {
				name,
				registry,
				amountOfHors: 0,
				type: 'common'
			})
			
			const fullNameArray = name.split(' ')
			const firstName = fullNameArray[0]
			const lastName = fullNameArray.slice(-1) || ''

			const initials = firstName[0] + lastName
			await updateProfile(user, {
				displayName: firstName,
				photoURL: `https://avatars.dicebear.com/api/initials/${initials.toUpperCase()}.svg`
			})

			return user
		}

		trySingUp()
		.then(user => {
			onCreateUser(user)
			navigate('/')
		})
		.catch(error => {
			console.log(error);
			const { message, code, firebaseCode } = error
			setError({ message, code })
			if (firebaseCode && process.env.NODE_ENV === 'development')
				console.error(firebaseCode)
		})
	}

	const containerStyle = { mb: '10px', width: '100%' }
	const inputProps = { style: { backgroundColor: '#fff' } }

	return (
		<AuthLayout>
			<TextField
				sx={containerStyle}
				label='Nome completo'
				onBlur={putEventTargetValue(setName)}
				inputProps={inputProps}
			/>
			<TextField
				sx={containerStyle}
				inputProps={inputProps}
				label='Matrícula'
				error={checkErrorCode(CustomErrorCodes.INVALID_REGISTRY)}
				helperText={checkErrorCode(CustomErrorCodes.INVALID_REGISTRY) && error.message}
				onChange={putEventTargetValue(setRegistry)}
			/>
			<FormControl sx={containerStyle}>
				<InputLabel>Email</InputLabel>
				<OutlinedInput
					sx={inputProps.style}
					label='Email'
					onBlur={putEventTargetValue(setEmail)}
					error={checkErrorCode(CustomErrorCodes.INVALID_CREDENTIALS)}
					defaultValue={state?.placeholder}
					endAdornment={
						<InputAdornment position="end">@gsuite.iff.edu.br</InputAdornment>
					}
				/>
				{checkErrorCode(CustomErrorCodes.INVALID_CREDENTIALS) &&
					<FormHelperText>{error.message}</FormHelperText>
				}
			</FormControl>
			<PasswordField
				label='Senha'
				containerSx={containerStyle}
				error={checkErrorCode(CustomErrorCodes.PASS_NOT_MATCH)}
				onBlur={putEventTargetValue(setPassword)}
				onChangeVisibility={setShowPassword}
			/>
			<TextField
				sx={containerStyle}
				inputProps={inputProps}
				label='Confirmar senha'
				type={showPassword ? 'text' : 'password'}
				error={checkErrorCode(CustomErrorCodes.PASS_NOT_MATCH)}
				helperText={checkErrorCode(CustomErrorCodes.PASS_NOT_MATCH) && error.message}
				onBlur={putEventTargetValue(setPasswordConfirmation)}
			/>
			<Typography component='p' variant="body1" mb="5px">
				Já tem uma conta? <Link to="/" component={RouterLink}>Entre aqui</Link>
			</Typography>
			<Button onClick={singUp} variant="contained">Cadastrar-se</Button>
		</AuthLayout>
	)
}