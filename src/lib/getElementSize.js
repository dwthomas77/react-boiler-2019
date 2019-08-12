/**
 * Takes a string of HTML, converts it to a temporary DOM element and returns the width and height
 * @param {string} str - a string of valid HTML
 * @param {string} selector - a valid CSS querySelector
 * @returns {{height: number, width: number}}
 */
export default function getElementSize(str, selector) {
    const positioningStyles = `
        visibility: hidden;
        position: absolute;
        top: 0;
        left: 0;
    `;

    const container = document.createElement('div');
    container.style.cssText = positioningStyles;
    container.innerHTML = str;
    document.body.appendChild(container);

    const element = !selector ? container : container.querySelector(selector);
    const height = element.offsetHeight;
    const width = element.offsetWidth;
    document.body.removeChild(container);

    return {
        height,
        width,
    };
}
