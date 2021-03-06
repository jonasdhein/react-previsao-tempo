import React, { useState, useEffect } from 'react';
import { ActivityIndicator, SafeAreaView, View, Text, StyleSheet, FlatList } from 'react-native';
import LottieView from "lottie-react-native";
import * as Location from 'expo-location';
import { condition } from '../../utils/condition';

import Menu from '../../components/Menu';
import Header from '../../components/Header';
import theme from '../../../theme';
import Conditions from '../../components/Conditions';
import Forecast from '../../components/Forecast';

import api, { key } from '../../services/api';

export default function Home() {

    const [errorMsg, setErrorMsg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [weather, setWeather] = useState([]);
    const [icon, setIcon] = useState({});
    const [background, setBackground] = useState(['#1ed6ff', '#97c1ff']);

    /*React.useEffect(() => {
        Toast.show({
            text1: 'Olá',
            text2: 'Bem-vindo(a) 👋'
        });
    }, []);*/

    //funcao anonima
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestPermissionsAsync();

            if (status !== 'granted') {
                setErrorMsg('Permissão negada para acesso da localização');
                setLoading(false);
                return;
            }

            console.log('permissao', status);

            let location = await Location.getCurrentPositionAsync({});

            console.log('location', location.coords);

            //const response = await api.get(`/weather?key=${key}&lat=-29.567&lon=-51.9205`);
            const response = await api.get(`/weather?key=${key}&lat=${location.coords.latitude}&lon=${location.coords.longitude}`)
                .then((response) => {
                    //console.log('sucesso', response);
                    setWeather(response.data);

                    if (response.data.results.currently === 'noite') {
                        setBackground(['#0c3741', '#0f2f61']);
                    }

                    /*switch (response.data.results.condition_slug) {
                        case 'clear_day':
                            setIcon({ name: 'partly-sunny', color: '#FFB300' });
                            break;
                        case 'rain':
                            setIcon({ name: 'rainy', color: '#FFF' });
                            break;
                        case 'storm':
                            setIcon({ name: 'rainy', color: '#FFF' });
                            break;
                    }*/

                    setLoading(false);
                    setIcon(condition(response.data.results.condition_slug));
                    //console.log(response.data.results);

                }).catch((error) => {
                    setErrorMsg(error.response);
                    console.log('erro', error.response.data.message);
                    console.log('error', errorMsg);
                });



        })();
    }, [])

    if (loading && errorMsg == null) {
        return (
            <View style={[styles.header, styles.horizontal]}>
                {/*<LottieView
                    resizeMode="center"
                    source={require('../../assets/animations/wind.json')}
                    loop
                    autoPlay
                />
                <Text style={{flex: 1, color: '#0c3741', fontSize: 20, fontWeight: 'bold', paddingTop: 20, margin: 30}}>Buscando dados da sua cidade</Text>
                */}
                <ActivityIndicator size="large" color="#0c3741" />
            </View>

        )
    } else if (loading && errorMsg != null) {
        return (
            <LottieView
                resizeMode="contain"
                source={require('../../assets/animations/error.json')}
                loop={false}
                autoPlay
                height={'100%'}
            />
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <Menu />

            <Header background={background} weather={weather} icon={icon} />

            <Conditions weather={weather} />

            <FlatList
                showsHorizontalScrollIndicator={false}
                horizontal={true}
                contentContainerStyle={{ paddingBottom: '5%' }}
                style={styles.list}
                data={weather.results.forecast}
                keyExtractor={item => item.date}
                renderItem={({ item }) => <Forecast data={item} />}
            />

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    header: {
        flex: 1,
        justifyContent: "center"
    },
    horizontal: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 10
    },
    header: {
        flex: 1,
        width: '95%',
        height: '95%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        paddingTop: 0
    },
    container: {
        flex: 1,
        marginTop: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e8f0ff',
        paddingTop: '5%',
    },
    list: {
        marginTop: 10,
    }
})