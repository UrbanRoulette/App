Alert = function(text, type) {
  var html = $('<div class="alert alert--' + type + '">' + text + '</div>');
  $('body').append(html);
  setTimeout(function() {
    $('.alert').remove();
  }, 2000);
}