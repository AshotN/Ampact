import { Component } from 'react'
const storage = require('electron-json-storage');
const remote = require('electron').remote;

module.exports = class SettingsView extends Component {

  constructor (props) {
  super(props);

  this.state = {
    serverIP: "",
    serverUsername: "",
    serverPassword: ""
  };

  storage.has('ampact', (err, hasKey) => {
    console.log(err, hasKey);
    if(!hasKey){
      storage.set('ampact', {}, (err) =>{
      if(err) {
        //TODO: Proper error handling
      }
    });
    } else {
    storage.get('ampact', (err, data) => {
      if(err) {
      //TODO: Proper error handling
      }
      this.setState(data);
      console.log(data);
    });
    }
  });


  this.handleChange = this.handleChange.bind(this);
  this.saveSettings = this.saveSettings.bind(this);

  }

  handleChange(event) {
  this.setState({ [event.target.id]: event.target.value });
  }

  closeSettings() {
  remote.getCurrentWindow().close();
  }

  saveSettings(){
  console.log(this.state);
  storage.set('ampact', this.state, (err) =>{
    if(err) {
    //TODO: Proper error handling
    }
  });
  }

  render () {
    return (
      <div className='settingsPage'>
        <div className='SettingsTitle'>
          <span>Settings</span>
          <div onClick={this.closeSettings} className='closeSettings'>X</div>
        </div>
        <div className='fields'>
          <div className='field'>
            <label htmlFor='serverIP'>Server IP</label>
            <input value={this.state.serverIP} onChange={this.handleChange} type='textbox' id='serverIP' />
          </div>
          <div className='field'>
            <label htmlFor='serverUsername'>Server Username</label>
            <input value={this.state.serverUsername} onChange={this.handleChange} type='textbox' id='serverUsername' />
          </div>
          <div className='field'>
            <label htmlFor='serverPassword'>Server Password</label>
            <input value={this.state.serverPassword} onChange={this.handleChange} type='textbox' id='serverPassword' />
          </div>
          <div className='field'>
            <button onClick={this.saveSettings}>Save</button>
          </div>
        </div>
      </div>
    );
  }
}
