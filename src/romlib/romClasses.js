define(function(require, exports, module) {

var types = {};

var Utils = require("romlib/utils");

/**
 * Used to maintain a registry of available ROM object types.
 *
 * This registry is static, but the class is declared non-static mainly so you
 * can instantiate it and use its indexer. :P
 */
var RomClasses = exports.RomClasses = function() {

};

(function(){

  /**
   * Represents a registered class entry within the ROM classes registry.
   */
  function Entry(id, type, handler) {
    this.ID = id;
    this.Type = type;
    this.Handler = handler;
  };

  /**
   * Gets a collection of entries for all registered classes.
   */
  exports.getTypes = function() {
    return Utils.values(types);
  }

  /**
   * Registers a class of objects. A class must be registered before it can be
   * used with (or by) PKHack's Rom class.
   *
   * @param id
   *            A string that identifies this type of object. (Example:
   *            "EnemyGroup")
   * @param type
   *            The type of the class representing this object.
   * @param handler
   *            A RomObjectHandler-derived object that will handle loading and
   *            storing elements of the class being registered.
   */
  exports.registerClass = function(id, type, handler) {
    console.log("RomClasses: Checking for collisions: " + type.name());

    var added = false;
    // Check for collisions

    Utils.each(Utils.values(types), function(e) {
        if (e.ID == id) {
            // throw new Exception("Type ID '" + id
            // + "' is already registered.");
            added = true;
        }
        if (e.Type == type) {
            // throw new Exception("Type '" + type.toString()
            // + "' is already registered.");
            added = true;
        }
        if (handler != null && e.Handler == handler) {
            // throw new Exception("Handler Type '" + handler.toString()
            // + "' is already registered.");
            added = true;
        }
    });

    // If all goes well, register the ID, type, and handler
    if (!added) {
        types[id] = new Entry(id, type, handler);
    }
  }

}).call(RomClasses.prototype);

});
