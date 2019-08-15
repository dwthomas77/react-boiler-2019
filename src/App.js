import React from 'react';
import { connect } from 'react-redux';
import List from './components/List';
import './App.scss';

function App() {
    return (
        <div className="App">
            <h2>React Boilerplate 2019</h2>
            <List />
        </div>
    );
}

function mapStateToProps(state) {
    console.log('state is', state);
    return {};
}

export default connect(
    mapStateToProps,
    null,
)(App)
