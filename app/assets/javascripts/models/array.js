DS.JSONTransforms.array = {
    // If the outgoing json is already a valid javascript array
    // then pass it through untouched. In all other cases, replace it
    // with an empty array.  This means null or undefined values
    // automatically become empty arrays when serializing this type.
    serialize: function(jsonData) {
      if (Em.typeOf(jsonData) === 'array') {
        return jsonData;
      } else {
        return [];
      }
    },
    // If the incoming data is a javascript array, pass it through.
    // If it is a string, then coerce it into an array by splitting
    // it on commas and trimming whitespace on each element.
    // Otherwise pass back an empty array.  This has the effect of
    // turning all other data types (including nulls and undefined
    // values) into empty arrays.
    deserialize: function(externalData) {
      switch (Em.typeOf(externalData)) {
        case 'array':
          return externalData;
        case 'string':
          return externalData.split(',').map(function(item) {
            return jQuery.trim(item);
          });
        default:
          return [];
      }
    }
  };
