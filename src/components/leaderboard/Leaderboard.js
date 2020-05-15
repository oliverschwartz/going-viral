import * as firebase from 'firebase';

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyAwKE37iPK3TB0gxnVuDTDMp2_VPpjl9As",
  authDomain: "going-viral-426.firebaseapp.com",
  databaseURL: "https://going-viral-426.firebaseio.com",
  projectId: "going-viral-426",
  storageBucket: "going-viral-426.appspot.com",
  messagingSenderId: "578362708669",
  appId: "1:578362708669:web:38550d4456181920161dd4",
  measurementId: "G-DSTZB4LMND",
};

class Leaderboard {
  constructor() {
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    firebase.analytics();
    var database = firebase.database();
    database.ref('hello/').set(2); 

  }
}

export default Leaderboard;
