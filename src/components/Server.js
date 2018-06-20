import React from 'react';
import { Button } from 'react-bootstrap';
import ReactJson from 'react-json-view';

const Server = ({ name, endpoints, status, onDelete }) => {
  const onclick = () => {
    onDelete(name);
  };

  return (
    <div className="server">
      <div className="container">
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">{name}</h3>
          </div>
          <div className="panel-body">
            {Object.keys(endpoints).map(key => (
              <div key={key}>
                <p>Name: {key}</p>
                <p>Address: {endpoints[key]}</p>
              </div>
            ))}
            <ReactJson src={status} />
            <Button bsStyle="danger" onClick={onclick}>
              Delete
            </Button>
            <div />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Server;
