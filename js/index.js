
$( document ).ready(function() {
  $('.content-section').hide();
  $('#page-tabs a').click(function(index, element) {
    $('#page-tabs a').removeClass('active');
    $('.content-section').hide();
    $(this).addClass('active');
    var showContentId = '#' + $(this).attr('id') + 'content';
    $(showContentId).show();
    if (showContentId == '#event-content') {
      $('#event-input').focus();
    }
  })

  
  $('#recruit-').click();

  // Start of Recruit

  var recruit;
  $.getJSON('./data/recruit.json', function(data){
    recruit = data;
  })

  $('#recruit-reset').click(function() {
    $('.recruit-tag-list a').removeClass('primary');
    $('.recruit-player-list div').remove();
    $('.recruit-player-tags a').remove();
    $('.recruit-player-tags br').remove();
  })

  $('.recruit-tag-list a').click(function() {
    $('.recruit-player-list div').remove();
    $('.recruit-player-tags a').remove();
    $('.recruit-player-tags br').remove();
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
      var playerProbs = [];

      $.each(activeTags, function(index, value) {
        if (recruit[value].includes(player)) {
          tags.push(value);
          playerProbs.push(1 / recruit[value].length);
        }
      })

      var rareTag = tags.reduce(function(a, b) {
        return recruit[a].length <= recruit[b].length ? a : b;
      })

      // console.log(playerProbs);
      
      var maxProb = playerProbs.reduce((a, b) => Math.max(a, b), -Infinity);

      playerText = player;
      tagsText = "";
      var maxProbText = "<div><a class='button primary'>" + "<span class='player-prob-tag'>" + maxProb.toLocaleString('en', {style: 'percent', minimumFractionDigits: 2}) + "</span> " + playerText + ""  + "<a class='button primary outline'>" + rareTag + "</a>" + "</a></div>";
      $.each(tags, function(index, value) {
        tagsText += "<a class='button primary outline'>" + value + "</a>"
      })
      activePlayerCount.push([maxProb, maxProbText, tags.length, playerText, tagsText,  tags]);
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

    // display matched players
    activePlayerCount.sort((a, b) => (a[0] < b[0]) ? 1 : -1);
    $.each(Array.from(activePlayerCount), function(index, value) {
      $('.recruit-player-list').append(value[1]);
    })
    
    // console.log(activePlayerCount);
    

    // add players to the page
    // activeTagNameAndNumber.sort((a, b) => (a[1] < b[1]) ? 1 : -1);
    // $.each(activeTagNameAndNumber, function(index, value) {
    //   if (value[1] > 1) {
    //     $('.recruit-player-list').append("<a class='button primary'>" + value[0] + ": " + value[1] + "</a>");
    //   } else {
    //     $('.recruit-player-list').append("<a class='button primary outline'>" + value[0] + ": " + value[1] + "</a>");
    //   }
    // })

    // $('.recruit-player-list').append('<hr>');

    
    $.each(Array.from(activePlayerCount), function(index, value) {
      var addPlayers = [];
      addPlayers.push( "<a class='button primary'>" + value[3] + "</a>" + value[4] + "<br>"); 
      $('.recruit-player-tags').append(addPlayers.join( "" ));

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
    '?????????LPL': {
      'SSR': 2.34, 'SR': 12.66, 'R': 85.0
    }, 
    '??????': {
      'SSR': 0.2, 'SR': 1.42, 'R': 33.33, 'N': 65.05, 
    }, 
    '????????????': {
      '?????????': 0.67, 'SSR': 1.41, 'SR': 14.93, 'R': 82.99, 
    }, 
    '????????????': {
      '?????????': 1.11, 'SSR': 1.13, 'SR': 13.89, 'R': 83.87, 
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

  function writeRow(pool, n, p, cha_p) {
    let probNone = rowNone(p, n);
    let probOne = rowGetN(p, n, 1);
    let probTwo = rowGetN(p, n, 2);
    let probThree = rowGetN(p, n, 3);
    let probFourAndAbove = 1 - probNone - probOne - probTwo - probThree;

    if (pool == '????????????') {
      let probCha = 1 - rowNone(cha_p, n);
      $('#prob-table tbody').append(
        "<tr><td>" + '???????????????????????????' + "</td><td>" + probCha.toLocaleString('en', {style: 'percent', minimumFractionDigits: 2}) + '</td></tr>'
      )
      $('#prob-table tbody').append(
        "<tr><td>" + '?????????????????????????????????' + "</td><td>" + (cha_p*n/100).toLocaleString({minimumFractionDigits: 2}) + '???</td></tr>'
      )
    } else if (pool == '????????????') {
      let probCha = 1 - rowNone(cha_p, n);
      $('#prob-table tbody').append(
        "<tr><td>" + '???????????????????????????' + "</td><td>" + probCha.toLocaleString('en', {style: 'percent', minimumFractionDigits: 2}) + '</td></tr>'
      )
      $('#prob-table tbody').append(
        "<tr><td>" + '?????????????????????????????????' + "</td><td>" + (cha_p*n/100).toLocaleString({minimumFractionDigits: 2}) + '???</td></tr>'
      )
    }

    $('#prob-table tbody').append(
      "<tr><td>" + '??????SSR????????????????????????' + "</td><td>" + probNone.toLocaleString('en', {style: 'percent', minimumFractionDigits: 2}) + '</td></tr>'
    )
    $('#prob-table tbody').append(
      "<tr><td>" + '????????????SSR????????????' + "</td><td>" + probOne.toLocaleString('en', {style: 'percent', minimumFractionDigits: 2}) + '</td></tr>'
    )
    $('#prob-table tbody').append(
      "<tr><td>" + '????????????SSR????????????' + "</td><td>" + probTwo.toLocaleString('en', {style: 'percent', minimumFractionDigits: 2}) + '</td></tr>'
    )
    $('#prob-table tbody').append(
      "<tr><td>" + '????????????SSR????????????' + "</td><td>" + probThree.toLocaleString('en', {style: 'percent', minimumFractionDigits: 2}) + '</td></tr>'
    )
    $('#prob-table tbody').append(
      "<tr><td>" + '????????????SSR?????????????????????' + "</td><td>" + probFourAndAbove.toLocaleString('en', {style: 'percent', minimumFractionDigits: 2}) + '</td></tr>'
    )

  }

  function calProb(pool, num) {
    console.log(pool, num);
    $('#prob-table tbody tr').remove();
    if (pool == '?????????LPL') {
      writeRow(pool, num, probPoolData[pool]['SSR']);
    } else if (pool == '??????') {
      writeRow(pool, num, probPoolData[pool]['SSR']);
    } else if (pool == '????????????') {
      writeRow(pool, num, probPoolData[pool]['SSR'] + probPoolData[pool]['?????????'], probPoolData[pool]['?????????']);
    } else if (pool == '????????????') {
      writeRow(pool, num, probPoolData[pool]['SSR'] + probPoolData[pool]['?????????'], probPoolData[pool]['?????????']);
    } else {
      alert('??????????????????');
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
    $('#prob-input-times').val('');
    poolTimes = $(this).text();
    calProb(poolSelected, poolTimes);
  })
  $('#prob-input-times').on('input', function() {
    $('.prob-times a').removeClass('primary');
    poolTimes = $(this).val();
    calProb(poolSelected, poolTimes);
  })

  // End of Prob

  // Start of BP
  // $('#bp-key-list a').click(function() {
  //   $('#bp-key-list a').removeClass('active');
  //   $(this).addClass('active');

  //   $('.bp-key-hero-list').hide();

  //   activeBpKeyTag = '#' + $(this).attr('id') + '-list';
    
  //   $(activeBpKeyTag).show();

  // })
  // $('#bp-ban-list a').click(function() {
  //   $('#bp-ban-list a').removeClass('active');
  //   $(this).addClass('active');

  //   $('.bp-ban-hero-list').hide();

  //   activeBpBanTag = '#' + $(this).attr('id') + '-list';
    
  //   $(activeBpBanTag).show();

  // })
  // $('#bp-we-pick-list a').click(function() {
  //   $('#bp-we-pick-list a').removeClass('active');
  //   $(this).addClass('active');

  //   $('.bp-we-pick-hero-list').hide();

  //   activeBpWePickTag = '#' + $(this).attr('id') + '-list';
    
  //   $(activeBpWePickTag).show();

  // })
  // $('#bp-rival-pick-list a').click(function() {
  //   $('#bp-rival-pick-list a').removeClass('active');
  //   $(this).addClass('active');

  //   $('.bp-rival-pick-hero-list').hide();

  //   activeBpRivalPickTag = '#' + $(this).attr('id') + '-list';
    
  //   $(activeBpRivalPickTag).show();

  // })

  // $('.bp-key-hero-list a, .bp-ban-hero-list a, .bp-we-pick-hero-list a, .bp-rival-pick-hero-list a').click(function() {
  //   $(this).toggleClass('primary');
  // })

  // $('#bp-key-reset').click(function() {
  //   $('.bp-key-hero-list a').removeClass('primary');
  // })
  // $('#bp-ban-reset').click(function() {
  //   $('.bp-ban-hero-list a').removeClass('primary');
  // })
  // $('#bp-we-pick-reset').click(function() {
  //   $('.bp-we-pick-hero-list a').removeClass('primary');
  // })
  // $('#bp-rival-pick-reset').click(function() {
  //   $('.bp-rival-pick-hero-list a').removeClass('primary');
  // })
  
  // $('#bp-key-top, #bp-ban-top, #bp-we-pick-top, #bp-rival-pick-top').click();

  // // function calTies()
  // var bp_data;
  // $.getJSON('./data/bp.json', function(data) {
  //   bp_data = data;

  //   var hero_info = bp_data
  //   var key_hero_info = ["??????", "??????", "??????", "??????"];
  //   var key_hero_lst = ["??????", "??????", "??????", "VN", "EZ"];
  //   var ban_hero_lst = ["??????"];
  //   var we_pick_lst = ["", "??????", "", "????????????", "???"];
  //   var rival_pick_lst = ["??????", "", "??????", "", ""];

  //   function calTies(hero_info, key_hero_lst, ban_hero_lst, we_pick_lst, rival_pick_lst){
  //     var we_power_lst = [];
  //     var rival_power_lst = [];
  //     var we_counter_lst = [];
  //     var rival_counter_lst = [];
  //     var we_coop_lst = [];
  //     var rival_coop_lst = [];

  //     var we_remain_positions = [0, 0, 0, 0, 0]
  //     for (let i=0; i < 5; i++) {
  //       if (we_pick_lst[i] == "") {
  //         we_remain_positions[i] = 1;
  //       }
  //     }
      

  //   }

  //   calTies(hero_info, key_hero_info, ban_hero_lst, we_pick_lst, rival_pick_lst)
    
  // })


  

  // End of BP


});
