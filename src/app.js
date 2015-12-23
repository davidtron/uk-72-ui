import React from 'react'
import ReactDOM from 'react-dom'
import SimpleMapPage from './google-test.jsx';

class App extends React.Component {
  render() {
    return (
      <main>
        You have been tangoed
      </main>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
ReactDOM.render(<SimpleMapPage />, document.getElementById('map'));


