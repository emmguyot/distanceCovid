/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  Button,
} from 'react-native';

import { Colors } from 'react-native/Libraries/NewAppScreen';
import Header from './Header.js';
import Geolocation from '@react-native-community/geolocation';
import {Notifications} from 'react-native-notifications';

export default class PositionScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            latitude: null,
            longitude: null,
            dateCoo: null,
            error: null,
            latitudeOrigine: 47.902964,
            longitudeOrigine: 1.909251,
        }
    }

    componentDidMount () {
        this.watchId = Geolocation.watchPosition(
            (position) => {
              this.setState({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                dateCoo: new Date(),
                error: null,
              });
            },
            (error) => this.setState({ error: error.message }),
            { enableHighAccuracy: true, timeout: 999999, maximumAge: 1000, distanceFilter: 10 },
          );
    }

    componentWillUnmount () {
        Geolocation.clearWatch(this.watchId);
    }

    calculeDistance() {
        // cf https://www.movable-type.co.uk/scripts/latlong.html
        const R = 6371e3; // metres
        const φ1 = this.state.latitude * Math.PI/180; // φ, λ in radians
        const φ2 = this.state.latitudeOrigine * Math.PI/180;
        const Δφ = (this.state.latitudeOrigine-this.state.latitude) * Math.PI/180;
        const Δλ = (this.state.longitudeOrigine-this.state.longitude) * Math.PI/180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        const d = R * c; // in metres

        const dkm = Math.round(d*100)/100000.0;

        if (dkm > 10) {
          let localNotification = Notifications.postLocalNotification({
              body: "Distance maximale dépassée : " + dkm + "km",
              title: "Trop loin",
              sound: "chime.aiff",
              silent: false,
              category: "SOME_CATEGORY",
              userInfo: { }
          });
        }

        return dkm;
    }

    changeOrigine = () => {
        this.setState({
            latitudeOrigine: this.state.latitude,
            longitudeOrigine: this.state.longitude,
        });
    }

    render() {
        return (
              <SafeAreaView>
                <ScrollView
                  contentInsetAdjustmentBehavior="automatic"
                  style={styles.scrollView}>
                  <Header text="Covid-19 : Distance à la maison" />
                  <View style={styles.body}>
                    <View style={styles.sectionContainer}>
                      <Text style={styles.sectionTitle}>Coordonnées obtenues</Text>
                      <Text style={styles.sectionDescription}>
                        { (this.state.dateCoo != null) ?
                            <>
                                Le <Text style={styles.highlight}>
                                    {this.state.dateCoo.getDate()}/{this.state.dateCoo.getMonth()+1}/{this.state.dateCoo.getFullYear()} 
                                    à {this.state.dateCoo.toLocaleTimeString()}</Text> :{"\n"}
                                Latitude : {this.state.latitude}{"\n"}
                                Longitude : {this.state.longitude}
                            </>
                          :
                            <>
                                Positionnement en cours...
                            </>
                        }
                      </Text>
                    </View>
                    { (this.state.error != null) ?
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>Erreur obtenue</Text>
                            <Text style={styles.sectionDescription}>
                                {this.state.error}
                            </Text>
                        </View>
                        : <></>
                    }
                    { (this.state.dateCoo != null) ?
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>Distance</Text>
                            <Text style={styles.sectionDescription}>
                                Vous êtes à {this.calculeDistance()} km
                            </Text>
                            <Button title="Changement de l'origine" onPress={this.changeOrigine}></Button>
                        </View>
                        : <></>
                    }
                    </View>
                </ScrollView>
              </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

