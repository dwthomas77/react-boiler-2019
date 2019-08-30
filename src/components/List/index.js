import React from 'react';
import PropTypes from 'prop-types';
import ListItem from '../ListItem';
import Filter from '../Filter';
import './styles.css';

const List = ({ items }) => (
    <div>
        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Sample List of Fetched Resources</div>
        <Filter />
        <ul>
            { items.map((value) => <ListItem {...value} key={value.name} />) }
        </ul>
    </div>
);

List.propTypes = { items: PropTypes.array.isRequired };

export default List;
