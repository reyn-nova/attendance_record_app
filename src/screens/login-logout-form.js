import React, { useEffect, useState } from 'react'
import { Alert, Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native'

import AsyncStorage from '@react-native-async-storage/async-storage'
import MapView, {Marker} from 'react-native-maps'
import ImagePicker from 'react-native-image-crop-picker'

import BASE_URL from '../helpers/base-url'

const LoginLogoutFormScreen = ({navigation, route}) => {
	const [base64, setBase64] = useState(null)
	const [userId, setUserId] = useState(null)

	useEffect(() => {
		loadUserId()
	}, [])

	const loadUserId = async() => {
		const { id } = JSON.parse(await AsyncStorage.getItem('loginData'))
		
		setUserId(id)
	}
	
	const { latitude, longitude } = route.params.position.coords

	navigation.setOptions({
		title: route.params.title
	})

	const { width } = useWindowDimensions()

	const pickImage = async() => {
		const res = await ImagePicker.openCamera({
			useFrontCamera: true,
			cropping: false,
			maxFiles: 1,
			includeBase64: true,
			compressImageQuality: 0.5
		})

		if (res?.data) {
			setBase64('data:image/jpeg;base64, ' + res.data)
		}
	}

	const submit = () => {
		const formData = new FormData()
		
		formData.append('sender_id', userId)
		formData.append('photo', base64)
		formData.append('latitude', latitude)
		formData.append('longitude', longitude)
		formData.append('type', route.params.title.toLowerCase())

		fetch(`${BASE_URL}/submit-status`, {
			headers: {
			  Accept: 'application/json',
			  'Content-type': 'multipart/form-data'
			},
			method: 'POST',
			body: formData
		  })
		  .then(res => res.json())
		  .then(resJSON => {
			if (resJSON.status === 'created') {
				Alert.alert(
					'Information',
					resJSON.info,
					[
						{
							onPress: navigation.goBack,
							text: 'OK'
						}
					],
					{
						cancelable: false
					}
				)
			} else {
			  Alert.alert('Information', resJSON.info)
			}
		})
	}

	return (
		<SafeAreaView
			style = {{
				backgroundColor: 'lightgray',
				flex: 1
			}}
		>
			<ScrollView
				contentContainerStyle = {{
					flexGrow: 1,
					padding: 20
				}}
				style = {{
					flex: 1
				}}
			>
				<TouchableOpacity
					onPress={pickImage}
					style = {{
						alignSelf: 'center',
						borderRadius: 20,
						overflow: 'hidden',
						borderWidth: 5,
						borderColor: 'white'
					}}
				>
					<Image
						source={{uri: base64}}
						style = {{
							backgroundColor: 'dimgray',
							height: 120,
							width: 120
						}}
					/>

					<View
						style = {{
							position: 'absolute',
							top: 0,
							right: 0,
							left: 0,
							bottom: 0,
							justifyContent: 'center',
							alignItems: 'center'
						}}
					>
						<Text
							style = {{
								color: 'white',
								fontSize: 32,
								fontWeight: 'bold',
								marginTop: -10
							}}
						>
							+
						</Text>

						<Text
							style = {{
								color: 'white',
								fontWeight: 'bold'
							}}
						>
							{base64 ? 'Change' : 'Add'} Photo
						</Text>
					</View>
				</TouchableOpacity>

				<View
					style = {{
						borderRadius: 20,
						marginTop: 20,
						borderWidth: 5,
						borderColor: 'white',
						overflow: 'hidden'
					}}
				>
					<MapView
						zoomEnabled={false}
						rotateEnabled={false}
						scrollEnabled={false}
						region={{
							latitude,
							longitude,
							latitudeDelta: 0.005,
							longitudeDelta: 0.005,
						}}
						key='AIzaSyC5v_sIm0x21CHdIJVAL_03UR3GHulyG1Y'
						style = {{
							height: (width - 40) / 16 * 9,
							width: width - 40,
						}}
					>
						<Marker
							coordinate={{
								latitude,
								longitude,
							}}
						/>
					</MapView>
				</View>

				<View
					style = {{
						flex: 1
					}}
				/>

				<TouchableOpacity
					activeOpacity={0.6}
					disabled = {!base64}
					onPress={submit}
					style = {{
						backgroundColor: base64 ? 'forestgreen' : 'gray',
						borderRadius: 10,
						padding: 15,
					}}
				>
					<Text
						style = {{
							color: 'white',
							fontSize: 20,
							fontWeight: 'bold',
							textAlign: 'center'
						}}
					>
						Submit
					</Text>
				</TouchableOpacity>
			</ScrollView>
		</SafeAreaView>
	)
}

export default LoginLogoutFormScreen