import React from 'react';
import { connect } from 'react-redux';
import debounce from 'debounce';
import wretch from 'wretch';
import resourcesSlice, { UPDATE_ALL_RESOURCES } from '../../reducers/resources';
import './styles.scss';

class Filter extends React.Component {
    state = { value: '' };

    changeHandler = (event) => {
        const { target: { value } } = event;
        console.log('the value is ', value);
        this.setState({ value });
        this.debouncedFetchResources(value);
    }

    fetchResources = (searchTerm) => {
        console.log('DEBOUNCED!!!');
        const { UPDATE_ALL_RESOURCES: updateAllResources } = this.props;
        wretch()
            .url(searchTerm ? `https://restcountries.eu/rest/v2/name/${searchTerm}` : 'https://restcountries.eu/rest/v2/all')
            .get()
            .json((json) => { updateAllResources(json) })
            .catch(() => { updateAllResources([]) });
    }

    constructor(props) {
        super(props);
        this.debouncedFetchResources = debounce(this.fetchResources, 500);
    }

    render() {
        const { value } = this.state;
        return (
            <div className="filter">
                <input type="text" value={value} onChange={this.changeHandler} />
                <span>Filter your results</span>
            </div>
        );
    }
}

const mapDispatchToProps = {
    [UPDATE_ALL_RESOURCES]: resourcesSlice.actions[UPDATE_ALL_RESOURCES],
};

export default connect(
    null,
    mapDispatchToProps,
)(Filter);
