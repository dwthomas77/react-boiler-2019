import find from 'lodash-es/find';
import isNumber from 'lodash-es/isNumber';

/**
 *
 * Row Builder - a module for updating collections of rows containing items
 *
 * @typedef {Row[]} Region - a collection of Rows
 * @typedef {Item[]} Row - a collection of Items
 *
 * @typedef {Object} Item - an object containing location data
 * @property {string} region - id of the Region this Item belongs to
 * @property {number} row - index value of Row containing this Item
 * @property {number} position - index value of the Item inside this Row
 * @property {number} id - unique identifier for this Item
 *
 * @typedef {Object} Actions - instructions for updating the region
 * @property {number} remove - the id of an item to remove from the region
 * @property {Object} add - data for an element to add to the region
 * @property {Object} add.item - the item to be added
 * @property {Location} add.targetLocation - the location where the item will be added
 *
 * @typedef {Object} Location - data indicating location in a Region and Row
 * @property {string} region - the item's target region
 * @property {number} row - the item's target row
 * @property {number} position - the item's target index position in the row
 * @property {boolean} newRow - indicates if a new row should be built
 */

const defaultConfig = {
    maxSize: 8,
};

/**
 * returns the correct location for adding single or grouped elements
 * Location should probably be a class or something?
 * @param {Object} actions
 * @returns {Location}
 */
function getTargetLocation(actions) {
    if (actions.add) {
        return { ...actions.add.location };
    } else if (actions.addGroup) {
        return { ...actions.addGroup.location };
    } else if (actions.removeRow) {
        return { ...actions.removeRow.location };
    } return {
        region: null,
        row: null,
        position: null,
        newRow: false,
    };
}

/**
 * adds one or more new items to a region
 * @param {Region} region
 * @param {Object} actions
 * @param {Object} targetLocation
 * @returns {Region}
 */
function addNewItems(region, actions, targetLocation = {}) {
    const updatedRegion = [...region];
    const { add = null, addGroup = null } = actions;
    const initialRow = targetLocation.row || region.length + 1;

    if (add) {
        const { item } = add;
        updatedRegion.push([
            {
                ...item,
                row: initialRow,
            },
        ]);
    } else if (addGroup) {
        const { groupedItems } = addGroup;
        groupedItems.forEach((item, index) => {
            updatedRegion.push([
                {
                    ...item,
                    row: initialRow + index,
                },
            ]);
        });
    }

    return updatedRegion;
}


/**
 * takes the current row and adds a group of items
 * @param {Object[]} items - list of grouped items to add to row
 * @param {Object} rowState - the current state of the row
 * @returns {{curPosIndex: *, curRow: *, curRowIndex: *, rowSize: *, updatedRows: *}}
 */
function addGroupedItemsToRow(items, rowState) {
    const {
        rowSize,
        updatedRows,
    } = rowState;

    let {
        curPosIndex,
        curRow,
        curRowIndex,
    } = rowState;

    curPosIndex = 1;

    if (curRow.length) {
        updatedRows.push([...curRow]);
        curRow = [];
        curRowIndex += 1;
    }

    items.forEach((item) => {
        updatedRows.push([{
            ...item,
            row: curRowIndex,
            position: 1,
        }]);

        curRowIndex += 1;
    });

    return {
        curPosIndex,
        curRow,
        curRowIndex,
        rowSize,
        updatedRows,
    };
}

/**
 * takes the current row state and adds one item at the current position
 * @param {Item} item - the item to be added
 * @param {Object} rowState - tracks current state for rebuilding rows
 * @param {Object} config - configuration options
 * @return {Object} - new rowState object
 */
function addItemToRow(item, rowState, config) {
    const {
        updatedRows,
    } = rowState;

    let {
        curPosIndex,
        curRow,
        curRowIndex,
        rowSize,
    } = rowState;

    const size = config.getSize(item);
    const isAboveSizeLimit = rowSize + size > config.maxSize;

    // if row at size cap then start a new row
    if (isAboveSizeLimit) {
        updatedRows.push([...curRow]);
        curRow = [];
        curRowIndex += 1;
        curPosIndex = 1;
        rowSize = size;
        // else continue building current row
    } else {
        curPosIndex += 1;
        rowSize += size;
    }

    curRow.push({
        ...item,
        row: curRowIndex,
        position: curPosIndex,
    });

    return {
        curPosIndex,
        curRow,
        curRowIndex,
        rowSize,
        updatedRows,
    };
}

/**
 * returns one or more rows given an existing Row and an Item to add
 * @param {number} rowIndex - index value for tracking current position in region
 * @param {Item[]} items - a list of items
 * @param {Action} actions - a group of actions
 * @param {Object} targetLocation - location of target
 * @param {Object} config - configuration options
 */
function buildRows(rowIndex, items = [], actions = {}, targetLocation = {}, config = {}) {
    const {
        remove,
        removeGroup,
        add,
        addGroup,
    } = actions;

    const {
        newRow,
        position,
        row,
    } = targetLocation;

    const addNewItemLast = !newRow && position
        ? rowIndex === row && items.length < position
        : false;

    let rowState = {
        curPosIndex: 0,
        curRow: [],
        curRowIndex: rowIndex,
        rowSize: 0,
        updatedRows: [],
    };

    let updatedRowIndex = rowIndex;

    // handle rows with items
    if (items.length) {
        items.forEach((item, index) => {
            const isAtTargetLocation = !newRow && position
                ? rowIndex === row && (index + 1) === position
                : false;

            // if new item target at this location
            if (isAtTargetLocation) {
                if (add) {
                    rowState = addItemToRow(add.item, rowState, config);
                } else if (addGroup) {
                    rowState = addGroupedItemsToRow(addGroup.groupedItems, rowState, config);
                }
            }

            const shouldAdd = item.slug !== remove &&
                (!removeGroup ||
                    !find(removeGroup, slug => item.slug === slug));

            // remove items by omitting their push call
            if (shouldAdd) {
                rowState = addItemToRow(item, rowState, config);
            }
        });

        // if new item target at last position of this row
        if (addNewItemLast) {
            if (add) {
                rowState = addItemToRow(add.item, rowState, config);
            } else if (addGroup) {
                rowState = addGroupedItemsToRow(addGroup.groupedItems, rowState, config);
            }
        }

        updatedRowIndex = rowState.updatedRows.length;

        // add current row it if contains any items
        if (rowState.curRow.length || updatedRowIndex === 1) {
            rowState.updatedRows.push(rowState.curRow);
        }

        // handle empty rows
    } else if (row === updatedRowIndex) {
        if (add) {
            rowState = addItemToRow(add.item, rowState, config);
        } else if (addGroup) {
            rowState = addGroupedItemsToRow(addGroup.groupedItems, rowState, config);
        }
        // add current row it if contains any items
        if (rowState.curRow.length || updatedRowIndex === 1) {
            rowState.updatedRows.push(rowState.curRow);
        }
    }

    return rowState.updatedRows;
}

/**
 * remove one row from a region
 * @param {Region} region
 * @param {Object} actions
 * @returns {Region}
 */
function removeRow(region, actions) {
    const updatedRegion = [...region];
    const { removeRow: removeRowIndex } = actions;
    if (removeRowIndex) {
        const { location: { row: rowIndex } } = removeRowIndex;
        updatedRegion.splice(rowIndex, 1);
        for (let i = rowIndex, len = updatedRegion.length; i < len; i += 1) {
            updatedRegion[i].forEach(
                element => element.row = element.row > rowIndex ?
                    element.row - 1 :
                    element.row
            );
        }
    }
    return updatedRegion;
}

/**
 * takes a region an rebuilds all the rows based on a set of actions
 * @param {Region} region - the list of rows to be rebuilt
 * @param {Actions} actions - a set of actions to perform on the region
 * @param {Object} regionConfig - configuration options for this region
 * @return {Region} - updated list of Rows
 */
export default function rebuildRegion(region = [], actions = {}, regionConfig = {}) {
    const config = {
        ...defaultConfig,
        ...regionConfig,
    };

    // rebuild from empty region
    let updatedRegion = [];

    // location for adding elements
    const targetLocation = getTargetLocation(actions);

    // rebuild each existing row in sequence
    region.forEach((row, index) => {
        const rowIndex = index + 1;

        // add new rows at this row index
        if (targetLocation.newRow && targetLocation.row === rowIndex) {
            updatedRegion = addNewItems(updatedRegion, actions);
        }

        // rebuild the current row by applying actions to it
        const nextRows = buildRows(
            rowIndex, // current row index
            row, // existing row to rebuild
            actions, // actions applied to this region
            targetLocation, // pass target location
            config, // region configurations
        );

        // handle results of new row
        if (nextRows.length) {
            updatedRegion.push(...nextRows);
        }
    });

    // add new rows positioned after last index
    if (targetLocation.row > region.length) {
        updatedRegion = addNewItems(updatedRegion, actions, targetLocation);
    }

    if (isNumber(targetLocation.row)) {
        updatedRegion = removeRow(updatedRegion, actions);
    }

    return updatedRegion;
}
