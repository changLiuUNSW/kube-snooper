import React, { Component } from 'react';
import axios from 'axios';
import Nav from './Nav';
import { Button } from 'react-bootstrap';
import Server from './Server';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      servers: [],
      error: null
    };
  }

  componentDidMount() {
    this.refresh();
  }

  refresh = () => {
    this.setState({ loading: true, error: null, servers: [] }, () => {
      this.fetchServers();
    });
  };

  fetchServers = async () => {
    try {
      const { data } = await axios.get('/api/servers');
      let ipAddr;
      for (const server of data) {
        for (const key in server.endpoints) {
          const [ip, port] = server.endpoints[key].split(':');
          if (port === '25565') {
            ipAddr = ip;
            break;
          }
        }
        try {
          const { data } = await axios.get(`http://mcapi.us/server/status?ip=${ipAddr}&port=25565`);
          server.status = data;
        } catch (error) {
          server.status = error;
        }
      }
      this.setState({ loading: false, error: null, servers: data });
    } catch (error) {
      this.setState({ loading: false, error });
    }
  };

  render() {
    return (
      <div className="app">
        <Nav />
        <div className="container app__btn-group">
          <Button bsStyle="primary" disabled={this.state.loading}>
            Add
          </Button>
          {this.state.error && <p>{this.state.error}</p>}
        </div>
        {this.state.servers.map(server => (
          <Server
            key={server.name}
            name={server.name}
            endpoints={server.endpoints}
            status={server.status}
          />
        ))}
      </div>
    );
  }
}

export default App;
