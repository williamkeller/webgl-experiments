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
    }
  }
})();
