import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import wretch from 'wretch';
import resourcesSlice, { UPDATE_ALL_RESOURCES } from './reducers/resources';
import List from './components/List';
import './App.scss';

class App extends React.Component {
    componentDidMount() {
        const { UPDATE_ALL_RESOURCES: updateAllResources } = this.props;
        wretch()
            .url('https://restcountries.eu/rest/v2/all')
            .get()
            .json((json) => { updateAllResources(json) });
    }

    render() {
        const { resources } = this.props;
        return (
            <div className="App">
                <h2>React Boilerplate 2019</h2>
                <div className="flex-layout">
                    <List items={resources} />
                    <div> Some other thing here </div>
                </div>

            </div>
        );
    }
}

App.propTypes = {
    resources: PropTypes.array.isRequired,
    UPDATE_ALL_RESOURCES: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
    return { resources: state.resources };
}

const mapDispatchToProps = {
    [UPDATE_ALL_RESOURCES]: resourcesSlice.actions[UPDATE_ALL_RESOURCES],
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(App);
