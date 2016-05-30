var UTIL = (function() {

  return {

    load_resource: function(url, callback) {
      $.ajax(url, {
        success: function(data, status, xhr) {
          callback("Success", data);
        },
        error: function(xhr, status, error) {
          callback("ERR: (" + url + ") " + status + 
              " " + error, null);
        }
      });
    },

    load_image: function(url, callback) {
      var image = new Image();
      image.onload = function() {
        callback("Success", image);
      };
      image.src = url;
    }
  }
})();
