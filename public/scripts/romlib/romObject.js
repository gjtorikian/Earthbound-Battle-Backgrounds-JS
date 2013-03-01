define(function(require, exports, module) {

var romObject = exports.romObject = function(name, age) {
    this.name = name;
    this.age = age;
    this.health = 100;
};

(function(){
    exports.die = function() {
        this.health = 0;
        console.log(this.health);
    };

    this.eat = function(what) {
        this.health += 5;
        console.log(this.health);
    };

}).call(romObject.prototype);

});