"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flattenObject = void 0;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const flattenObject = (obj, deep = true) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const flattenedObject = {};
    for (const key in obj) {
        if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
            let recursiveResult = obj[key];
            if (deep)
                recursiveResult = (0, exports.flattenObject)(recursiveResult);
            for (const deepKey in recursiveResult) {
                if (Object.hasOwn(obj, key))
                    flattenedObject[`${key}.${deepKey}`] = recursiveResult[deepKey];
            }
        }
    }
    return flattenedObject;
};
exports.flattenObject = flattenObject;
