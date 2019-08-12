import get from 'lodash-es/get';
import find from 'lodash-es/find';
import map from 'lodash-es/map';
import { Status } from 'enums';
import { stepTypeToUrlType } from 'lib/typeHelpers';

const domain = document.domain;
const domainRegex = new RegExp(`https?://${domain}(:\\d+)?`, 'g');
const nonUniqueElementTypes = [
    'blank_row',
    'custom_text',
    'custom_choice',
    'custom_hidden',
    'html',
    'image',
    'static_text',
    'submit',
    'video',
];
const notFormElementTypes = [
    'html',
    'image',
    'submit',
    'static_text',
    'video',
];
const contentElements = [
    'HTML',
    'Text',
    'Blank Row',
    'Image',
    'Video',
];

export function alphaSort(a = '', b = '') {
    const relativePosition = a.localeCompare(b);
    const isBefore = relativePosition < 0;
    const isAfter = relativePosition > 0;
    if (isBefore) { return -1; }
    if (isAfter) { return 1; }
    return 0;
}

export function buildOptions(data) {
    const options = map(data, (label, value) => ({ label, value }));
    const labelSort = ({ label: a }, { label: b }) => alphaSort(a, b);
    return options.sort(labelSort);
}

export function calcImageDisplaySize(elWidth, rowHeight, width, height, aspectRatio, rowMargin = 5) {
    const autoHeight = height < rowHeight ? height
        : (width < elWidth ? width : elWidth) / aspectRatio;

    let displayHeight = autoHeight < rowHeight ?
        autoHeight :
        rowHeight * Math.floor(autoHeight / rowHeight);

    const rows = Math.floor(displayHeight / rowHeight) || 1;

    displayHeight += (rows - 1) * rowMargin;

    const displayWidth = displayHeight * aspectRatio;

    return {
        displayWidth,
        displayHeight,
    };
}

/**
 * copies the specified text to the clipboard on supported browsers
 * @returns {boolean} (+ side-effect)
 */
export function copyToClipboard(string) {
    const textarea = document.createElement('textarea');
    textarea.textContent = string;
    textarea.style.position = 'fixed';
    document.body.appendChild(textarea);
    textarea.select();

    try {
        return document.execCommand('copy');
    } catch (e) {
        return false;
    } finally {
        document.body.removeChild(textarea);
    }
}

export const fetchImageSize = url => new Promise((resolve, reject) => {
    const img = new Image();

    window.setTimeout(() => reject(null), 3000);

    img.onload = function onLoad() {
        const height = img.height;
        const width = img.width;
        resolve({
            height,
            width,
            aspectRatio: width / height,
        });
    };

    img.src = url;
});

export function fileToDataURI(file) {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onloadend = (event) => { resolve(event.target.result); };
        reader.onerror = reject;

        reader.readAsDataURL(file);
    });
}

/**
 * check parent nodes to test if a data value exists
 * accepts maxIterations to reduce the chance for expensive DOM operations
 * @param {Node} rootNode - target node
 * @param {String} dataKey - the dataset key
 * @param {String} dataValue - the dataset value
 * @param {Number} maxIterations - max number of DOM calls
 * @returns {boolean} - true if a parent was found with the correct dataset value
 */
export function findParentData(rootNode, dataKey, dataValue, maxIterations) {
    let count = 0;
    let nextNode = rootNode;
    while (count < maxIterations) {
        if (nextNode.dataset && nextNode.dataset[dataKey] === dataValue) {
            return true;
        }
        if (nextNode.parentNode) {
            count += 1;
            nextNode = nextNode.parentNode;
        } else {
            return false;
        }
    }
    return false;
}

/**
 * calculates given height to that of a number or rows with margins
 * @param {number} currentHeight
 * @param {number} rowHeight
 * @param {number} rowMargin
 * @returns {number}
 */
export function heightInRows(currentHeight, rowHeight, rowMargin) {
    const rows = currentHeight > rowHeight
        ? Math.ceil(currentHeight / (rowHeight + rowMargin))
        : 1;

    const marginHeight = (rows - 1) * rowMargin;

    return (rows * rowHeight) + marginHeight;
}

/**
 * determines if this is an end step given a step type or data
 * @param {Object|String} step - a step object or the type value of a step
 * @returns {boolean}
 */
export function isEndStep(step) {
    const stepType = typeof step === 'string' ? step : step.type;
    const endTypes = [
        'INTERNAL_REF',
        'PAGE',
        'STATIC_URL',
    ];
    return endTypes.includes(stepType);
}
export const hasEmailField = elements => !!find(elements, el => isType('email_address')(el));
/**
 * Now that there is a element definition slug assign type by looking at that instead of at slug which is now
 * settable by users.
 * @param type
 * @returns {function(*=): (*|boolean)}
 */
export const isType = type => element =>
    (
        (element && element.element_definition_slug && element.element_definition_slug === type) ||
        (element && element.slug && element.slug.indexOf(type) !== -1)
    );
export const isFormElement = element => !find(notFormElementTypes, type => isType(type)(element));
export const isContentType = element => contentElements.includes(element.dragLabel);
export const isNonSubmitElement = element => !isType('submit')(element);
export const isUniqueElement = element =>
    !find(nonUniqueElementTypes, type => isType(type)(element));

/**
 * loads a given stylesheet url into the head of the document
 * @param {string} url
 */
export const loadStylesheet = (url) => {
    const head = document.head;
    const link = document.createElement('link');

    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = url;

    head.appendChild(link);
};

/** removeDomain :: String -> String
 * removes the current domain from a URL string
 * @param {string} string
 * @returns {string}
 */
export const removeDomain = string => typeof string === 'string' ? string.replace(domainRegex, '') : string;

/**
 * compares two Arrays of primitive values at a shallow level to determine if they are equal
 * @param {Array} listA
 * @param {Array} listB
 * @returns {boolean}
 */
export const isShallowEqual = (listA, listB) => {
    if (listA.length !== listB.length) {
        return false;
    }
    let count = 0;
    const max = listA.length;
    while (count < max) {
        if (listA[count] !== listB[count]) {
            return false
        }
        count += 1;
    }
    return true;
};

export const stepUrl = pageType => stepType => id => (`/tf/${stepTypeToUrlType(stepType)}/${pageType.toLowerCase()}/${id}`);
export const builderUrl = stepUrl('builder');
// export const previewUrl = stepUrl('preview');

export const getUnpublishedLink = (node) => {
    const targetJourney = get(node, '_embedded.target_journey');
    const targetStep = get(node, '_embedded.target_step');
    const targetNode = get(targetStep, '_links.self.href') === get(node, '_links.target.href') ?
        targetStep :
        targetJourney;

    if (targetNode.status === Status.UNPUBLISHED) {
        return {
            href: builderUrl(targetStep.type)(targetStep.id),
            name: targetNode.name,
            type: targetNode.type,
        };
    }

    return false;
};

/**
 *
 * @param {Object} elements - current elements
 * @param {Object} elementDefinitions
 * @param {string} slug
 * @returns {number} the next slug version for this slug
 */
export function getNextSlugVersion(elements, elementDefinitions, slug) {
    const relevantSlugNumbers = Object.values(elements)
        .filter(element => element.element_definition_slug === slug)
        .map(({ slug: elSlug }) => Number(elSlug.split('_').reverse()[0]));
    return !relevantSlugNumbers.length
        ? 0 : Math.max(...relevantSlugNumbers.filter(num => !isNaN(num)), -1) + 1;
}


/** sequential related utilities */

/**
 * @param {array}  sequentialRegions
 * @returns {object} sequentialKeyMap
 */

export function generateSequentialKeyMap(sequentialRegions) {
    const sequentialKeyMap = {};
    sequentialRegions.map(s => sequentialKeyMap[s.name] = s.sequentialKey);
    return sequentialKeyMap;
}

/**
 * @param {array}  sequentialRegions
 * @param {object} SequentialKeyMap
 * @returns {array} sorted sequential regions
 */
export function sortBySequentialKey(sequentialRegions, SequentialKeyMap) {
    return sequentialRegions.sort((a, b) => (SequentialKeyMap[a.region] > SequentialKeyMap[b.region])
        ? 1
        : ((SequentialKeyMap[b.region] > SequentialKeyMap[a.region]) ? -1 : 0));
}

/**
 * @param {object} Step
 * @returns {Boolean} is a donation form
 */

export function isDonationForm(step) {
    return !!step.elements.find(element => element === 'credit_card');
}

/**
 * @param {object} Step
 * @returns {Boolean} has a payment gateway set up
 */

export function hasPaymentGateway(step) {
    return !!get(step, '_links.merchant_account.href');
}

/**
 * Compare two element arrays. If the element is different than the pending element
 * then remove the specified setting from the element so that it will be completely
 * replaced by the pending element. That is needed to allow elements to be deleted.
 *
 * Used in elements selector and reducer
 * @param {array} element
 * @param {array} pendingElement
 * @param {string} slugToFilter
 * @param {string} settingToDelete
 * @returns {*|{settings}}
 */
export const filterSettingForDelete = (element, pendingElement, slugToFilter, settingToDelete) => {
    let filteredElement = element;
    if (
        element.element_definition_slug === slugToFilter &&
        pendingElement.settings &&
        'options' in pendingElement.settings &&
        pendingElement.settings.options.length > 0
    ) {
        filteredElement = { ...element, settings: { ...element.settings, [settingToDelete]: [] } };
    }

    return filteredElement;
};

/**
 * Validate the input slug to contain alphanumeric, dashes and underscore characters
 *
 * @param {string} value
 * @returns {boolean} is valid
 */
export function isInputSlugValid(value) {
    const re = /^[a-zA-Z0-9-_]+$/;
    return re.test(value);
}

/**
 * Generate an alphanumeric hash of the requested length
 *
 * @param length
 * @returns {string|string}
 */
export function generateHash(length) {
    let result = '';
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = length; i > 0; i -= 1) {
        result += chars[Math.round(Math.random() * (chars.length - 1))];
    }
    return result;
}
