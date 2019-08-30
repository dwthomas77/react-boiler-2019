import React from 'react';
import PropTypes from 'prop-types';

const ListItem = ({ name }) => (<li>{name}</li>);

ListItem.propTypes = { name: PropTypes.string.isRequired };

export default ListItem;
