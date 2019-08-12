/**
 * hotspots - a module for managing hotspots
 *
 * Drag Hotspots
 *  - tests x,y coordinates against an area and collection of child areas
 *  - returns positional meta data associated with the active hotspot (top, right, bottom, left)
 *
 * Hover Hotspots
 *  - tests x,y coordinates against a collection of child areas
 *  - returns the id value associated with the active hotspot child
 */

/**
 * @typedef {Object} Position
 * @property {number} top - The top X Coordinate
 * @property {number} bottom - The bottom X Coordinate
 * @property {number} left - The left Y Coordinate
 * @property {number} right - The right Y Coordinate
 */

/**
 * @typedef {Object} Area - a set of data used to generate a unique hotspot
 *  - contains x,y coordinates of the area's boundaries
 *  - cotains a unique identifier
 *  - contains an index reference to its order in a list of sibling areas
 *  - can contain a list of child areas which provide additional hotspots
 * @property {Position} position - x,y coordinates for area boundaries
 * @property {number} index - the order of this area in the list
 * @property {number|string} id - the unique identifier for this area
 * @property {Area[]} children - a list of child areas
 */

/**
 * Position checking utility functions
 */
const aboveBottom = (y, bottom, spacing) => y <= (bottom + spacing);
const aboveBottomFold = (y, bottom, foldHeight) => y <= (bottom - foldHeight);
const aboveTopFold = (y, top, foldHeight) => y <= (top + foldHeight);
const belowBottomFold = (y, bottom, foldHeight) => y > (bottom - foldHeight);
const belowTop = (y, top, spacing) => y >= (top - spacing);
const belowTopFold = (y, top, foldHeight) => y > (top + foldHeight);
const childLeft = (x, left, spacing, foldWidth) => x >= (left - spacing) && x <= (left + foldWidth);
const childRight = (x, right, spacing, foldWidth) => x <= right + spacing && x >= right - foldWidth;
const isInside = (x, y, { top, bottom, left, right }, spacing) =>
    y > (top - spacing) && y < (bottom + spacing)
    && x > (left - spacing) && x < (right + spacing);
const areaLeft = (x, left, foldWidth) => x <= left + foldWidth;

const defaultConfig = {
    drag: {
        offsetY: 0.2,
        offsetX: 0.50,
        offsetHighlight: 5,
    },
    hover: {
        offsetActive: 15,
    },
};

/**
 * given x,y coordinates, a collection of hotspots and metaData
 * returns the result associated with the provided type of hotspot
 * @param {number} x - x mouse coordinates
 * @param {number} y - y mouse coordinates
 * @param {function[]} hotspots - the hotspot functions to check against
 * @param {Object} metaData - additional data associated with this interaction
 * @return {Object|number} - the result of the hotspot check
 */
export function checkHotspots(x, y, hotspots, metaData) {
    let result = null;

    hotspots.forEach((hotspot) => {
        const check = hotspot(x, y, metaData);
        if (check) {
            result = check;
        }
    });

    return result;
}

/**
 * returns hotspot checking functions based on type
 * @param {string[]} types - a list of types to generate hotspots for
 * @param {Area[]} areas - a list of areas to generate hotspots from
 * @param {number|string} id - unique id associated with this region of areas
 * @param {Object} config - configuration options for overriding defaults
 * @return {Object} - group of hotspot checking functions by type
 */
export function generateHotspots({ types = [], areas = [], config = {} }) {
    const hotspots = {};

    types.forEach((type) => {
        const typeConfig = {
            ...defaultConfig[type],
            ...config[type],
        };

        switch (type) {
            case 'drag':
                hotspots[type] = areas.map(
                    area => generateDragHotspot(area, typeConfig),
                );
                break;
            case 'hover':
                hotspots[type] = areas.map(
                    area => generateHoverHotspot(area, typeConfig),
                );
                break;
            default:
        }
    });

    return hotspots;
}

/**
 * returns a function which checks for mouse coords in this hotspot
 * @param {Area} area - the coordinates this hotspot is based off of
 * @param {Object} config - configuration options for overriding defaults
 * @param {number} config.offsetX - percentage number to define left and right values
 * @param {number} config.offsetY - percentage number to define top and bottom values
 * @param {number} config.offsetHighlight - pixel width or height of  highlight elements
 * @return {function} - group of hotspot checking functions by type
 */
function generateDragHotspot(area, config) {
    /**
     * @param {number} x - x mouse coordinates
     * @param {number} y - y mouse coordinates
     * @return {function} - checks x y against hotspot coords
     */
    return (x, y) => {
        const {
            position,
        } = area;

        const {
            bottom,
            left,
            right,
            top,
        } = position;

        const height = bottom - top;
        const width = right - left;
        const foldHeight = height * config.offsetY;
        const foldWidth = width * config.offsetX;

        const hasChildren = !!(area.children && area.children.length);

        let result = null;

        // if inside this region
        if (isInside(x, y, position, config.offsetHighlight)) {
            // if in this middle portion of this area
            if (belowTopFold(y, top, foldHeight) &&
                aboveBottomFold(y, bottom, foldHeight)) {
                // check all children areas
                if (hasChildren) {
                    result = checkChildHotspots(x, area, config);
                } else {
                    result = {
                        id: area.index,
                        childId: 1,
                        modifier: 'left',
                    };
                }

                if (result === null) {
                    // if no child hotspots are active check left portion
                    if (areaLeft(x, left, foldWidth)) {
                        result = {
                            id: area.index,
                            modifier: 'left',
                        };

                        // else default to right portion modifier
                    } else {
                        result = {
                            id: area.index,
                            modifier: 'right',
                        };
                    }
                }
            } else if (belowTop(y, top, config.offsetHighlight) &&
                aboveTopFold(y, top, foldHeight)) {
                // highlight top only if this is the first row
                // or this row is not empty and the previous row is not empty
                if (area.isFirstRow || (hasChildren && !area.emptyRowAbove)) {
                    result = {
                        id: area.index,
                        modifier: 'top',
                    };
                } else if (hasChildren) {
                    result = checkChildHotspots(x, area, config);
                } else {
                    result = {
                        id: area.index,
                        childId: 1,
                        modifier: 'left',
                    };
                }
            } else if (belowBottomFold(y, bottom, foldHeight) &&
                aboveBottom(y, bottom, config.offsetHighlight)) {
                // highlight bottom if this is the last row
                // or if this row and next row are not empty
                if (area.isLastRow || hasChildren && !area.emptyRowBelow) {
                    result = {
                        id: area.index,
                        modifier: 'bottom',
                    };
                } else if (hasChildren) {
                    result = checkChildHotspots(x, area, config);
                } else {
                    result = {
                        id: area.index,
                        childId: 1,
                        modifier: 'left',
                    };
                }
            }
        }

        return result;
    };
}

/**
 * returns a function which checks for mouse coords in this hotspot
 * @param {Area} area - the coordinates this hotspot is based off of
 * @param {Object} config - configuration options for overriding defaults
 * @param {number} config.offsetActive - pixel offset of active hotspots
 * @return {Object} - group of hotspot checking functions by type
 */
function generateHoverHotspot(area, config) {
    /**
     * @param {number} x - x mouse coordinates
     * @param {number} y - y mouse coordinates
     * @return {function} - checks x y against hotspot coords and returns result or false
     */
    return (x, y, { activeId }) => {
        // find the active hotspot
        const activeHotspot = activeId ?
            ((area || {}).children || []).find(child => child.id === activeId) : false;

        const nextChildAvailable = (area, index) => area.children
            && area.children.length
            && index < area.children.length;

        let index = 0;

        // if there is an active hover
        if (activeHotspot) {
            // check to see if mouse coordinates are inside of it
            if (x > activeHotspot.position.left - config.offsetActive &&
                x < activeHotspot.position.right + config.offsetActive &&
                y > activeHotspot.position.top - config.offsetActive &&
                y < activeHotspot.position.bottom + config.offsetActive) {
                return activeHotspot.id;
            }
        }

        // if not in active hotspot check all other hotspots
        while (nextChildAvailable(area, index)) {
            if (x > area.children[index].position.left &&
                x < area.children[index].position.right &&
                y > area.children[index].position.top &&
                y < area.children[index].position.bottom) {
                return area.children[index].id;
            }
            index += 1;
        }

        return false;
    };
}

/**
 * checks the current x mouse position against a single row of child components
 * @param {number} x - the x mouse coordinate
 * @param {Area} area - the coordinates this hotspot is based off of
 * @param {Object} config - configuration options for overriding defaults
 * @return {Object} - the result from checking child hotspots
 */
function checkChildHotspots(x, area, config) {
    let index = 0;
    let result = null;

    while (index < area.children.length) {
        const child = area.children[index];

        const {
            position,
        } = child;

        const {
            left,
            right,
        } = position;

        const width = right - left;
        const foldWidth = width * config.offsetX;

        // if inside the left portion of a child area
        if (childLeft(
            x,
            left,
            config.offsetHighlight,
            foldWidth,
        )) {
            result = {
                id: area.index,
                childId: child.index,
                modifier: 'left',
            };
            // if inside the right portion of a child area
        } else if (childRight(
            x,
            right,
            config.offsetHighlight,
            foldWidth,
        )) {
            result = {
                id: area.index,
                childId: child.index,
                modifier: 'right',
            };
        }
        index += 1;
    }

    return result;
}
