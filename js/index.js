
$( document ).ready(function() {
  $('.content-section').hide();
  $('.tabs a').click(function(index, element) {
    $('.tabs a').removeClass('active');
    $('.content-section').hide();
    $(this).addClass('active');
    var showContentId = '#' + $(this).attr('id') + 'content';
    $(showContentId).show();
  })

  $('#recruit-').click();

  var gift;
  $.getJSON('./data/gift.json', function(data){
      gift = data;
  })

  $(".player-list a").each(function(index, element) {
      $(this).hide();
  });

  $('.gift-list a').click(function(index, element) {
      $('.player-list a').each(function() {$(this).hide()});
      $('.gift-list a').each(function() {$(this).removeClass('primary')});
      $(this).addClass('primary');
      var currentGift = $(this).text();
      $.each(gift[currentGift], function(index, value) {
          $('.player-list a').each(function() {
              if ($(this).text() == value) {
                  $(this).show();
              }
          });
      });

  })

});