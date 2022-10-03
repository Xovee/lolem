
$( document ).ready(function() {
  $('.content-section').hide();
  $('.tabs a').click(function(index, element) {
    $('.tabs a').removeClass('active');
    $('.content-section').hide();
    $(this).addClass('active');
    var showContentId = '#' + $(this).attr('id') + 'content';
    $(showContentId).show();
    if (showContentId == '#event-content') {
      $('#event-input').focus();
    }
  })

  
  $('#prob-').click();

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

  // Start of Event
  var event;
  $.getJSON('./data/club-event.json', function(data) {
    event = data;
  })

  $('#event-input').on('input', function() {
    $('#event-table-body tr').hide();
    var inputText = $('#event-input').val();
    $.each(event, function(index, value) {
      if (index.includes(inputText)) {
        addRowText = '<tr><td>' + index + "</td><td>" + value[0] + "</td><td>" + value[1] + "</td></tr>";
        $('#event-table-body').append(addRowText);
      }
    })
  })
  
  // End of Event

  // Start of Prob
  probPoolData = {
    '总决赛LPL': {
      'SSR (22夏+22决赛)': 2.34, 'SR (22夏+22决赛)': 12.66, 'R (22夏+22决赛)': 85.0
    }, 
    '友情': {
      'SSR (22夏+22决赛)': 0.2, 'SR (22夏+22决赛)': 1.42, 'R (22夏+22决赛)': 33.33, 'N (22夏)': 65.05, 
    }, 
    '22世界赛': {
      'SSR': 1.67, 'SR': 12.66, 'R': 85.67, 
    }, 
    '我是冠军': {
      '冠军卡': 0.67, 'SSR (22夏)': 1.41, 'SR (22夏+22决赛)': 14.93, 'R (22夏+22决赛)': 82.99, 
    }, 
    '冠军再临': {
      '冠军卡': 1.11, 'SSR (22夏)': 1.13, 'SR (22夏+22决赛)': 13.89, 'R (22夏+22决赛)': 83.87, 
    }
  }

  var poolSelected = '';
  var poolTimes = 0;

  function factorial(r) {
    let s = BigInt(1);
    var i = BigInt(r)
    while (i > 1) s *= i--;
    return s;
  }

  // n*(n-1)*....*(n-r+1) / factorial(r)
  function combinations(n, r){
      let s = BigInt(1);
      let i = BigInt(r);
      while(i<n) s*=++i;
      return s/factorial(n-r)
  }

  function rowNone(ssrProb, num) {
    ssrProb /= 100;
    return Math.pow(1-ssrProb, num);
  }

  function rowGetN(ssrProb, num, N) {
    ssrProb /= 100;
    return Math.pow(ssrProb, N) * Math.pow(1-ssrProb, num-N) * Number(combinations(num, N));
  }

  function writeRow(pool, n, p) {
    let probNone = rowNone(p, n);
    let probOne = rowGetN(p, n, 1);
    let probTwo = rowGetN(p, n, 2);
    let probThree = rowGetN(p, n, 3);
    let probFourAndAbove = 1 - probNone - probOne - probTwo - probThree;
    $('#prob-table tbody').append(
      "<tr><td>" + '一个SSR也抽不出的概率：' + "</td><td>" + probNone.toLocaleString('en', {style: 'percent', minimumFractionDigits: 2}) + '</td></tr>'
    )
    $('#prob-table tbody').append(
      "<tr><td>" + '抽出一个SSR的概率：' + "</td><td>" + probOne.toLocaleString('en', {style: 'percent', minimumFractionDigits: 2}) + '</td></tr>'
    )
    $('#prob-table tbody').append(
      "<tr><td>" + '抽出二个SSR的概率：' + "</td><td>" + probTwo.toLocaleString('en', {style: 'percent', minimumFractionDigits: 2}) + '</td></tr>'
    )
    $('#prob-table tbody').append(
      "<tr><td>" + '抽出三个SSR的概率：' + "</td><td>" + probThree.toLocaleString('en', {style: 'percent', minimumFractionDigits: 2}) + '</td></tr>'
    )
    $('#prob-table tbody').append(
      "<tr><td>" + '抽出四个SSR及以上的概率：' + "</td><td>" + probFourAndAbove.toLocaleString('en', {style: 'percent', minimumFractionDigits: 2}) + '</td></tr>'
    )
    

    // if (x == 'rowNone') {
    //   rowText = '一个SSR也抽不出的概率：';
    //   finalProb = rowNone(p, n);
    // } else if (x == 'rowGetN') {
    //   rowText = '抽出一个SSR的概率：';
    //   finalProb = rowGetN(p, n);
    // } else {
    //   alert('wtf?!');
    // }

    // $('#prob-table tbody').append(
    //   "<tr><td>" + rowText + "</td><td>" + finalProb.toLocaleString('en', {style: 'percent', minimumFractionDigits: 2}) + '</td></tr>'
    // );

  }

  function calProb(pool, num) {
    console.log(pool, num);
    $('#prob-table tbody tr').remove();
    if (pool == '总决赛LPL') {
      writeRow(pool, num, probPoolData[pool]['SSR (22夏+22决赛)']);
    } else if (pool == '友情') {
      writeRow(pool, num, probPoolData[pool]['SSR (22夏+22决赛)']);
    }
  }

  $('.prob-pool-list a').click(function() {
    $('#prob-table tbody tr').remove();
    $('#prob-input-times').val('');
    $('.prob-pool-list a').removeClass('primary');
    $('.prob-times a').removeClass('primary');
    $(this).addClass('primary');
    poolSelected = $(this).text();
  })
  $('.prob-times p a').click(function() {
    $('.prob-times a').removeClass('primary');
    $(this).addClass('primary');
    poolTimes = $(this).text();
    calProb(poolSelected, poolTimes);
  })
  $('#prob-input-times').on('input', function() {
    $('.prob-times a').removeClass('primary');
    poolTimes = $(this).val();
    calProb(poolSelected, poolTimes);
  })

  // End of Prob

  // Start of Gift

  var gift;
  $.getJSON('./data/gift.json', function(data) {
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
