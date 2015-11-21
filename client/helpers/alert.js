Alert = function(text, type) {
  var html = $('<div class="alert alert--' + type + '">' + text + '</div>');
  $('body').append(html);
}