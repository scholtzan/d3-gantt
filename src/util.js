d3.ganttDiagram.util = {
  /**
   * Merges attributes of two object.
   * In case of duplicates, the attribute values of the second object will be chosen.
   *
   * @param {object} obj1 - first object
   * @param {object} obj2 - second object
   */
  extend: function(obj1, obj2) {
    var result = {};

    for (var a1 in obj1) {
      result[a1] = obj1[a1];
    }

    for (var a2 in obj2) {
      result[a2] = obj2[a2];
    }

    return result;
  }
};
