export function antiParameterPullution(object){
    switch (typeof(object)) {
        case 'string':
            return object;
        case 'object':
            return Object.values(object)[0];
        default:
            return null;
    }
}