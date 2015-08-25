// just an example. it can be any type of storage
var InMemoryStorage = function() {
    var _storage = {};
    return {
        setValue: function(key, value) {
            _storage[key] = value;
        },
        getValue: function(key, defaultValue) {
            return _storage[key] || defaultValue;
        }
    }
};
