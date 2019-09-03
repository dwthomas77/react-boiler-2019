import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import selectedResource, { UPDATE_SELECTED_RESOURCE } from '../../reducers/selectedResource';
import ListItem from '../ListItem';
import Filter from '../Filter';
import './styles.css';

const List = ({ items, selectedResource, UPDATE_SELECTED_RESOURCE: updateSelectedResource }) => (
    <div>
        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>TEST API: REST COUNTRIES</div>
        <div><a href="https://restcountries.eu">restcountries.eu</a></div>
        <Filter />
        <ul>
            { items.map((value) => (
                <ListItem
                    {...value}
                    clickHandler={updateSelectedResource}
                    isActive={selectedResource === value.alpha3Code}
                    key={value.name}
                />
            ))}
        </ul>
    </div>
);

List.propTypes = {
    items: PropTypes.array.isRequired,
    selectedResource: PropTypes.string,
    UPDATE_SELECTED_RESOURCE: PropTypes.func.isRequired,
};

List.defaultProps = {
    selectedResource: '',
}

const mapDispatchToProps = {
    [UPDATE_SELECTED_RESOURCE]: selectedResource.actions[UPDATE_SELECTED_RESOURCE],
};

export default connect(
    (state) => ({ selectedResource: state.selectedResource }),
    mapDispatchToProps,
)(List);
