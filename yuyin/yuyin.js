var discordWidget = discordWidget || (function(){
  var _params = {};
  var version = '1.0';

  return {
    init : function(Params) {
      Params.serverId = typeof Params.serverId !== 'undefined' ? Params.serverId : false;
      Params.title = typeof Params.title !== 'undefined' ? Params.title : false;
      Params.join = typeof Params.join !== 'undefined' ? Params.join : true;
      Params.alphabetical = typeof Params.alphabetical !== 'undefined' ? Params.alphabetical : false;
      Params.theme = typeof Params.theme !== 'undefined' ? Params.theme : 'light';
      Params.hideChannels = typeof Params.hideChannels !== 'undefined' ? Params.hideChannels : false;
      Params.showAllUsers = typeof Params.showAllUsers !== 'undefined' ? Params.showAllUsers : false;
      Params.allUsersDefaultState = typeof Params.allUsersDefaultState !== 'undefined' ? Params.allUsersDefaultState : true;
      Params.showNick = typeof Params.showNick !== 'undefined' ? Params.showNick : true;
      _params.serverId = Params.serverId;
      _params.title = Params.title;
      _params.join = Params.join;
      _params.alphabetical = Params.alphabetical;
      _params.theme = Params.theme;
      _params.hideChannels = Params.hideChannels;
      _params.showAllUsers = Params.showAllUsers;
      _params.allUsersDefaultState = Params.allUsersDefaultState;
      _params.showNick = Params.showNick;
    },
    render : function() {
      if (window.jQuery) {
        renderAll();
      } else {
        var s = document.createElement("script");
        s.type = "text/javascript";
        s.src = "https://shoutwikis.github.io/yuyin/jquery_local.min.js";
        document.head.appendChild(s);

        s.onload = function () {
          renderAll();
        }
      }
      function renderAll() {
        var themeFile = '';
        switch (_params.theme) {
          case 'dark':
          themeFile = 'dark.css';
          break;
          case 'light':
          themeFile = 'light.min.css';
          break;
          case 'none':
          themeFile = 'none.min.css';
          break;
          default:
          themeFile = 'light.min.css';
        }
        $('head').append('<link rel="stylesheet" href="https://shoutwikis.github.io/yuyin/' + themeFile + '" type="text/css" />');

        var url = 'https://discordapp.com/api/servers/' + _params.serverId + '/embed.json';

        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var data = JSON.parse(xmlhttp.responseText);
            renderWidget(data, _params);
            if (!_params.allUsersDefaultState) {
              $('.discord-allusers').toggle();
              $('.discord-allusers-toggle').html('&#9656; 其他');
            }
            $('.discord-allusers-toggle').click(function(){
              $('.discord-allusers').toggle(100, function(){
                if ($('.discord-allusers').is(':visible')) {
                  $('.discord-allusers-toggle').html('&#9662; 其他');
                } else {
                  $('.discord-allusers-toggle').html('&#9656; 其他');
                }
              });
            });
          } else if (xmlhttp.readyState == 4 && xmlhttp.status == 404) {
            renderWidget('404', _params);
          } else if (xmlhttp.readyState == 4) {
            renderWidget(xmlhttp.status, _params);
          }
        }
        xmlhttp.open('GET', url, true);
        xmlhttp.send();

        function sortChannels(a, b) {
          if (a.position < b.position)
          return -1;
          if (a.position > b.position)
          return 1;
          return 0;
        }

        function renderChannel(name) {
          return '<li class="discord-channel">' + name + '</li><ul class="discord-userlist">';
        }
        function renderUser(member, channelId) {
          var userName = '';
          if (_params.showNick == true && member.nick) {
            userName = member.nick;
          } else {
            userName = member.username;
          }
          var gameName = '';
          if (member.game){
			  gameName = member.game.name;
			  switch(gameName) {
					case "Guild Wars 2":
						gameName = "激战 2";
						break;
					case "Guildwars 2":
						gameName = "激战 2";
						break;
					case "Guild Wars":
						gameName = "激战";
						break;
					case "Guildwars":
						gameName = "激战";
						break;
					case "League of Legends":
						gameName = "英雄联盟";
						break;
					case "LoL":
						gameName = "英雄联盟";
						break;
					case "Overwatch":
						gameName = "斗阵特工";
						break;
					case "Starcraft 2":
						gameName = "星际争霸 2";
						break;
					case "World of Warcraft":
						gameName = "魔兽世界";
						break;
					default:
						break;
			 }
			 gameName = ' - ' + gameName;
		 }
          if (member.channel_id == channelId) {
            if (member.status != 'online') {
              return '<li class="discord-user"><img src="' + member.avatar_url +
              '" class="discord-avatar"/><div class="discord-user-status discord-idle"></div>' +
              userName + '<span>' + gameName + '</span></li>';
            } else {
              return '<li class="discord-user"><img src="' + member.avatar_url +
              '" class="discord-avatar"/><div class="discord-user-status discord-online"></div>' +
              userName + '<span>' + gameName + '</span></li>';
            }
          }
          else {
            return '';
          }
        }

        function renderWidget(d, p) {
          var widgetElement = $('.discord-widget')[0];
          $(widgetElement).attr("version", version);
          var defaultInnerHtml = '<ul class="discord-tree"></ul><p class="discord-users-online"></p><p class="discord-join"></p><div class="discord-fade"></div>';
          var formatted = '';
          var gameName = '';
          var treeElement, usersElement, joinElement;
          var channels, users, hideChannel, hiddenChannels;

          if (p.title !== false) {
            widgetElement.innerHTML = '<div class="discord-title"><h3>' + p.title + '</h3></div>' + defaultInnerHtml;
            treeElement = $('.discord-tree')[0];
          } else {
            widgetElement.innerHTML = defaultInnerHtml;
            treeElement = $('.discord-tree')[0];
            treeElement.style.marginTop = '0';
          }

          switch (d) {
            case '404': treeElement.innerHTML = '<span class="discord-error">频道号码无效</span>';
            break;
            case '522': treeElement.innerHTML = '<span class="discord-error">语音频道出错</span>';
            break;
          }

          if (!d) {
            treeElement.innerHTML = d;
            return;
          }

          usersElement = $('.discord-users-online')[0];
          joinElement = $('.discord-join')[0];

          if (p.alphabetical) {
            channels = [];
            hiddenChannels = [];
            for (var i = 0; i < d.channels.length; i++) {
              hideChannel = false;
              for (var j = 0; j < p.hideChannels.length; j++) {
                  if (d.channels[i].name.indexOf(p.hideChannels[j]) >= 0){
                  hideChannel = true;
                }
              }
              if (!hideChannel) {
                channels.push(d.channels[i]);
              } else {
                hiddenChannels.push(d.channels[i].id);
              }
            }

            for (var i = 0; i < channels.length; i++) {
              formatted += renderChannel(channels[i].name);
              for (var j = 0; j < d.members.length; j++) {
                formatted += renderUser(d.members[j], channels[i].id);
              }
              formatted += '</ul>';
            }
          } else {
            channels = [];
            hiddenChannels = [];
            for (var i = 0; i < d.channels.length; i++) {
              hideChannel = false;
              for (var j = 0; j < p.hideChannels.length; j++) {
                if (d.channels[i].name.indexOf(p.hideChannels[j]) >= 0){
                  hideChannel = true;
                }
              }
              if (!hideChannel) {
                channels.push(d.channels[i]);
              } else {
                hiddenChannels.push(d.channels[i].id);
              }
            }
            channels.sort(sortChannels);

            for (var i = 0; i < channels.length; i++) {
              formatted += renderChannel(channels[i].name);
              for (var j = 0; j < d.members.length; j++) {
                formatted += renderUser(d.members[j], channels[i].id);
              }
              formatted += '</ul>';
            }
          }

          if (p.showAllUsers) {
            formatted += '<li class="discord-channel discord-allusers-toggle">&#9662; 其他</li><ul class="discord-userlist discord-allusers">';
            for (var i = 0; i < d.members.length; i++) {
              if (!d.members[i].channel_id || $.inArray(d.members[i].channel_id, hiddenChannels) >= 0) {
                formatted += renderUser(d.members[i], d.members[i].channel_id);
              }
            }
            formatted += '</ul>';
          }

          var discordJoin = '';
          if (d.instant_invite != 'null')
          discordJoin = '<a href="' + d.instant_invite + '" target="_blank">直接进入</a>';

          treeElement.innerHTML = formatted;
          usersElement.innerHTML = '在线人数: ' + d.members.length;
          if (p.join) {
            joinElement.innerHTML = discordJoin;
          } else {
            joinElement.style.display = 'none';
          }
        }
      }
    }
  };
}());
