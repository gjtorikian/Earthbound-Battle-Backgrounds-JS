define(function(require, exports, module) {

var breaker = {};

/**
 * Just some methods yoinked from Underscore
 */
var Utils = exports.Utils = function() {

};

(function(){

  exports.values = function(obj) {
    var keys = this.keys(obj);
    var length = keys.length;
    var values = new Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  exports.keys = function(obj) {
    var keys = [];
    for (var key in obj) if (this.has(obj, key)) keys.push(key);
    return keys;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  exports.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  exports.each = function(obj, iterator, context) {
    var keys = this.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
    }
  };

  exports.findWhere = function(obj, attrs, first) {
    return this.find(obj, function(value) {
      for (var key in attrs) {
        if (attrs[key] !== value[key]) return false;
      }
      return true;
    });
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  exports.find = function(obj, iterator, context) {
    var result;
    this.any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  exports.any = function(obj, iterator, context) {
    var result = false;
    if (obj == null) return result;
    this.each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };
}).call(Utils.prototype);

});
