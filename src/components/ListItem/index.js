import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const ListItem = ({ alpha3Code, clickHandler, isActive, name }) => {
    const liClickHandler = () => { clickHandler(alpha3Code); };
    const classes = classNames('list-item', { 'list-item--active': isActive });
    return (<li className={classes} onClick={liClickHandler}>{name}</li>);
};

ListItem.propTypes = { name: PropTypes.string.isRequired };

export default ListItem;
