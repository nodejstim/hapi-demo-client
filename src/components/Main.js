require('normalize.css');
require('styles/App.css');

import React from 'react';
import Store from '../stores/messages.js';
import Nes from 'nes/client';

class AppComponent extends React.Component {

  constructor() {
    super();

    this.userName = ' ';
    this.state = {
      messages: []
    };

    this.client = new Nes.Client('ws://localhost:3000');
  }

  componentWillMount() {
    Store.subscribe(this.onStoreChange.bind(this));

    this.client.connect((err) => {
      if (err) {
        console.log(err);
      }
    });

    this.client.subscribe('/messages', (payload) => {
      Store.add(payload);
      Store.emitChange();
    }, () => {});
  }

  componentDidMount() {
    var username = '';

    do {
      username = prompt('Enter name:');
    } while (!username.length);

    this.userName = username;
  }

  onStoreChange() {
    this.setState({messages: Store.get()});
  }

  sendMessage(e) {
    e.preventDefault();
    let from = this.userName;
    let msg = this.refs['msg'].value;

    if (!from.length || !msg.length) {
      alert('Name and message is required');
      return;
    }

    this.client.request({
      method: 'POST',
      path: '/message',
      payload: { from, msg }
    }, () => { });

    this.refs['form'].reset();
  }

  render() {
    return (
      <div>
        <ul className="messages" ref='messages'>
          {this.state.messages.map((msg, k) => {
            return <li key={k}><span className='msgSender'>{msg.from}:</span> {msg.msg}</li>
          })}
        </ul>
        <form className='form' ref='form'>
          <input autoComplete="off" className='msg' placeholder='message' ref='msg'/>
          <button onClick={this.sendMessage.bind(this)}>Send</button>
        </form>
      </div>
    );
  }
}

AppComponent.defaultProps = {};

export default AppComponent;
