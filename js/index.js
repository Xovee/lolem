
$( document ).ready(function() {
  $('.content-section').hide();
  $('.tabs a').click(function(index, element) {
    $('.tabs a').removeClass('active');
    $('.content-section').hide();
    $(this).addClass('active');
    var showContentId = '#' + $(this).attr('id') + 'content';
    $(showContentId).show();
  })

  
  $('#equipment-').click();

  // Start of Recruit

  var recruit;
  $.getJSON('./data/recruit.json', function(data){
    recruit = data;
  })

  $('#recruit-reset').click(function() {
    $('.recruit-tag-list a').removeClass('primary');
    $('.recruit-player-list a').hide();
    $('.recruit-player-list br').hide();
    $('.recruit-player-list hr').hide();
  })

  $('.recruit-tag-list a').click(function() {
    $('.recruit-player-list a').hide();
    $('.recruit-player-list br').hide();
    $('.recruit-player-list hr').hide();
    $(this).toggleClass('primary');
    var activeTags = [];
    $('.recruit-tag-list a').each(function(index, element) {
      if ($(this).attr('class').includes('primary')) {
        activeTags.push($(this).text());
      }
    })

    // traverse players
    var activePlayerSet = new Set();
    $.each(activeTags, function(index, value) {
      $.each(recruit[value], function(index, value) {
        activePlayerSet.add(value);
      })
    })

    var activePlayerList = Array.from(activePlayerSet);
    var activePlayerCount = [];
    $.each(activePlayerList, function(index, value) {
      var player = value;
      var tags = [];
      $.each(activeTags, function(index, value) {
        if (recruit[value].includes(player)) {
          tags.push(value);
        }
      })
      playerText = player;
      tagsText = "";
      $.each(tags, function(index, value) {
        tagsText += "<a class='button primary outline'>" + value + "</a>"
      })
      activePlayerCount.push([tags.length, playerText, tagsText, tags]);
    })

    // count active tags number
    var allActiveTags = []; // with duplicates
    var activeTagNumbers = {}; 
    $.each(activePlayerCount, function(index, value) {
      var currentTags = value[3];
      allActiveTags.push(currentTags);
    })
    $.each(allActiveTags, function(index, value) {
      activeTagNumbers[value] = (activeTagNumbers[value] || 0) + 1;
    })
    var activeTagNameAndNumber = Object.entries(activeTagNumbers);
    

    // add players to the page
    activeTagNameAndNumber.sort((a, b) => (a[1] < b[1]) ? 1 : -1);
    $.each(activeTagNameAndNumber, function(index, value) {
      if (value[1] > 1) {
        $('.recruit-player-list').append("<a class='button primary'>" + value[0] + ": " + value[1] + "</a>");
      } else {
        $('.recruit-player-list').append("<a class='button primary outline'>" + value[0] + ": " + value[1] + "</a>");
      }
    })

    $('.recruit-player-list').append('<hr>');

    activePlayerCount.sort((a, b) => (a[0] < b[0]) ? 1 : -1);
    $.each(Array.from(activePlayerCount), function(index, value) {
      var addPlayers = [];
      addPlayers.push( "<a class='button primary'>" + value[1] + "</a>" + value[2] + "<br>"); 
      $('.recruit-player-list').append(addPlayers.join( "" ));

    })
    
  })


  // End of Recruit

  // Start of Gift

  var gift;
  $.getJSON('./data/gift.json', function(data){
      gift = data;
  })

  $(".gift-player-list a, .gift-employee-list a").each(function(index, element) {
      $(this).hide();
  });

  $('.gift-list a').click(function(index, element) {
      $('.gift-player-list a').add('.gift-employee-list a').each(function() {$(this).hide()});
      $('.gift-list a').each(function() {$(this).removeClass('primary')});
      $(this).addClass('primary');
      var currentGift = $(this).text();
      $.each(gift['选手'][currentGift], function(index, value) {
          $('.gift-player-list a').each(function() {
              if ($(this).text() == value) {
                  $(this).show();
              }
          });
      });
      $.each(gift['职员'][currentGift], function(index, value) {
        $('.gift-employee-list a').each(function() {
            if ($(this).text() == value) {
                $(this).show();
            }
        });
    });

  })
  // End of Gift

});