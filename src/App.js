import React, { Component } from 'react';
import './App.css';

class App extends Component {

  state = {
    isEditing: true,
    textarea: '',
    emotion: '',
  };

  handleClick = () => {
    this.setState({
      isEditing: false,
    })
  };

  handleChange = (e) => {
    this.setState({
      textarea: e.target.value,
    })
  }

  handleFeels = (e) => {
    if(e.target.checked) {
      this.setState({
        emotion: e.target.value,
      })
    }
  }

  render() {

    const { isEditing, textarea, emotion } = this.state;
    return (
      <div className="App">
        {isEditing ?
          <div>
            <textarea onChange={this.handleChange} />
            <radiogroup>
              <label>😃<input name="emotions" type="radio" value="happy" onChange={this.handleFeels} /></label>
              <label>❓<input name="emotions" type="radio" value="question" onChange={this.handleFeels} /></label>
              <label>😕<input name="emotions" type="radio" value="meh" onChange={this.handleFeels}/></label>
              <label>😟<input name="emotions" type="radio" value="sad" onChange={this.handleFeels}/></label>
            </radiogroup>
            <button onClick={this.handleClick}>👁</button>
          </div>
          :
          <div>
            {textarea}
            {emotion === 'happy' && '😃'}
            {emotion === 'question' && '❓'}
            {emotion === 'meh' && '😟'}
            {emotion === 'sad' && '😕'}
            1 of 1
          </div>
        }
      </div>
    );
  }
}

export default App;
