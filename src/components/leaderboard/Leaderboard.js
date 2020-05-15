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

    // Get the top 10 scores. 
    let scoresRef = database.ref('scores').orderByChild('score').limitToLast(10);
    let scores = []; 
    scoresRef.once('value', function(snapshot) {
      snapshot.forEach(function(child) {
        scores.push(child);
      });

      // Display them in the leaderboard. 
      scores.reverse().forEach(function(obj) {
        $('#leaderboardTable tr:last').after('<tr><td>' + obj.key + '</td><td>' + obj.val()['score'] + '</td></tr>');
      })
    });
  }
}

export default Leaderboard;
