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

  onAdd = () => {
    this.addServer();
    this.refresh();
  };

  fetchServers = async () => {
    try {
      const { data } = await axios.get('/api/servers');
      let ipAddr;
      for (const server of data) {
        let found = false;
        for (const key in server.endpoints) {
          const [ip, port] = server.endpoints[key].split(':');
          if (port === '25565') {
            ipAddr = ip;
            found = true;
            break;
          }
        }
        server.found = found;
        if (found) {
          try {
            const { data } = await axios.get(
              `http://mcapi.us/server/status?ip=${ipAddr}&port=25565`
            );
            server.status = data;
          } catch (error) {
            server.status = error;
          }
        }
      }
      this.setState({ loading: false, error: null, servers: data });
    } catch (error) {
      this.setState({ loading: false, error });
    }
  };

  addServer = async () => {
    try {
      await axios.post('/api/servers/add');
    } catch (error) {
      console.log(error);
    }
  };

  render() {
    return (
      <div className="app">
        <Nav />
        <div className="container app__btn-group">
          <Button
            className="app__btn-group__add"
            bsStyle="primary"
            onClick={this.onAdd}
            disabled={this.state.loading}
          >
            Add
          </Button>
          <Button disabled={this.state.loading} onClick={this.refresh}>
            Refresh
          </Button>
          {this.state.error && <p>{this.state.error}</p>}
        </div>
        {this.state.servers
          .filter(l => l.found)
          .map(server => (
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
