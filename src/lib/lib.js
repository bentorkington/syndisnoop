
export function firstOrNull(arrayObject)
{
    if (arrayObject.length > 0)
        return arrayObject[0];

    return null;
}

export function forEachNode(nodeList, callback, scope) {
    for (var i = 0; i < nodeList.length; i++) {
        callback.call(scope, nodeList[i]);
    }
}

export function hasAncestorWithClass(element, targetClass) {
    if (!element.className) return false;
    if (element.className.split(' ').indexOf(targetClass) >= 0) return true;
    return element.parentNode && hasAncestorWithClass(element.parentNode, targetClass);
}

// 0 = January, 11 = December. Let's just deal with this and move on.
export function getMonthFromString(str) {
    // see http://stackoverflow.com/questions/13566552/easiest-way-to-convert-month-name-to-month-number-in-js-jan-01
    return new Date(Date.parse(str + " 1, 2017")).getMonth();
}
