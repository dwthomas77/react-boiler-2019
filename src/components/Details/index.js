import React from 'react';
import { connect } from 'react-redux';
import './styles.scss';

const Details = ({ resource }) => {
    const keys = Object.keys(resource);
    return (
        <div className="details">
            <div>Country Details</div>
            <div className="details-list">
                { keys.map((key) => {
                    return (
                        <div>
                            <span className="detail-key">{`${key}:`}</span>
                            {resource[key] ? resource[key].toString() : 'null'}
                        </div>
                    );
                })}
            </div>

        </div>
    );
};

function mapStateToProps(state) {
    const { resources, selectedResource } = state;
    return { resource: selectedResource ? resources.find((resource) => resource.alpha3Code === selectedResource) : {} };
}

export default connect(
    mapStateToProps,
)(Details);
