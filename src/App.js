import React, { Component } from 'react';
import './App.css';

class App extends Component {

  state = {
    isEditing: true,
    textarea: '',
    emotion: '',
    completedCards: {},
    visibleCard: null,
    visitor: null,
  };

  constructor(props) {
    super(props);

    if (this.props.firebaseApp) {
      this.firebaseApp = this.props.firebaseApp;
    } else {
      this.firebaseApp = require('./firebase.js').default;
    }

    // Auth.onAuthStateChanged((user) => {
    //   this.setState({
    //     visitor: user,
    //   });
    // });

    const cardsData = this.firebaseApp.database().ref('cards');

    cardsData.on('value', (snapshot) => {
      this.updateCards(snapshot.val());
    });
  };

  updateCards(data) {
    this.setState({ completedCards: data });
  }

  handleReview = () => {
    this.setState({
      isEditing: false,
      visibleCard: 0,
    });
    this.handleNew();
  };

  handleNew = () => {
    this.createNewCard();
    this.handleClear();
  };

  createNewCard = () => {
    const newCardKey = this.firebaseApp.database().ref().child('cards').push().key;

    this.firebaseApp.database().ref(`cards/${newCardKey}`).set({
      textarea: this.state.textarea,
      emotion: this.state.emotion,
      // user: this.state.visitor.uid,
    });
  };

  handleClear = () => {
    this.setState({
      textarea: '',
      emotion: '',
    })
  };

  handleChange = (e) => {
    this.setState({
      textarea: e.target.value,
    })
  };

  handleFeels = (e) => {
    if(e.target.checked) {
      this.setState({
        emotion: e.target.value,
      })
    }
  };

  handleNext = () => {
    const cardIds = this.getCardIds();
    if(this.state.visibleCard + 1 <= cardIds.length) {
      this.setState({
        visibleCard: this.state.visibleCard + 1,
      })
    }
  }
  // Login crap
  // login = () => {
  //   Auth.signInWithPopup(Provider)
  //     .then((result) => {
  //       this.setVisitor(result.user);
  //       this.setUserProfile(result.user);
  //     });
  // };
  //
  // logout = () => {
  //   Auth.signOut()
  //     .then(() => {
  //       this.setVisitor(null);
  //     });
  // };

  getCardIds = () => {
    if(this.state.completedCards) {
      return Object.keys(this.state.completedCards);
    } else {
      return null;
    }
  };

  setVisitor = (data) => {
    this.setState({ visitor: data });
  };

  setUserProfile = (user) => {
    this.firebaseApp.database().ref(`users/${user.uid}/profile`).set({
      displayName: user.displayName,
      photoURL: user.photoURL,
    });
  };
  // End login crap

  render() {

    const { isEditing, completedCards, emotion, textarea, visitor, visibleCard } = this.state;
    const cardIds = this.getCardIds();

    return (
      <div className="App">
        <header className="App-header">
        {visitor ?
          <div>
            Welcome {visitor.displayName}
            <button className="App-auth" onClick={this.logout}>Log out</button>
          </div>
          :
          <button className="App-auth" onClick={this.login}>Log In</button>
        }
        </header>
        {isEditing ?
          <div>
            <textarea className="App-text"  onChange={this.handleChange} value={textarea} />
            <label className="App-label">😃<input name="emotions" type="radio" value="happy" checked={emotion === 'happy'} onChange={this.handleFeels} /></label>
            <label className="App-label">❓<input name="emotions" type="radio" value="question" checked={emotion === 'question'} onChange={this.handleFeels} /></label>
            <label className="App-label">😕<input name="emotions" type="radio" value="meh" checked={emotion === 'meh'} onChange={this.handleFeels}/></label>
            <label className="App-label">😟<input name="emotions" type="radio" value="sad" checked={emotion === 'sad'} onChange={this.handleFeels}/></label>
            <button onClick={this.handleNew}>🔜</button>
            <button onClick={this.handleReview}>👁</button>
          </div>
          :
          cardIds && cardIds[visibleCard] &&
            <div>
              <div key={completedCards[cardIds[visibleCard]].textarea}>
                {completedCards[cardIds[visibleCard]].textarea}
                {completedCards[cardIds[visibleCard]].emotion === 'happy' && '😃'}
                {completedCards[cardIds[visibleCard]].emotion === 'question' && '❓'}
                {completedCards[cardIds[visibleCard]].emotion === 'meh' && '😟'}
                {completedCards[cardIds[visibleCard]].emotion === 'sad' && '😕'}
                {visibleCard + 1} of {cardIds.length}
              </div>
              <button onClick={this.handleNext}>next</button>
            </div>
        }
      </div>
    );
  }
}

export default App;
