var Providers = new Array();

/* Providers sourced from dumble-providers.js */
Providers.push(YoutubeProvider);
Providers.push(GoogleVideoProvider);
Providers.push(CollegeHumorProvider);
Providers.push(FlickrProvider);
Providers.push(AmazonProvider); 
Providers.push(IMDbProvider);
Providers.push(FunnyOrDieProvider);
Providers.push(GenericImageProvider);
Providers.push(GenericLinkProvider); /* Should be last in the array! */

var Dumble = Dumble ? Dumble : {
    currentUser: 'antrix',
    currentTag: '',
    currentData: [],
    currentURL: function() {
            return this.urlFor(this.currentUser, this.currentTag);
            },
    urlFor: function(user, tag) {
                return 'http://del.icio.us/feeds/json/' + user + '/' + tag;
            },
    friendsURLFor: function(user) {
                return 'http://del.icio.us/feeds/json/network/' + user;
            },
    permalink: function() {
                return location.protocol + '//' + location.host + location.pathname + '?u=' + this.currentUser
                  + (this.currentTag ? '&t=' + this.currentTag : '');
            },
    writeCookie: function() {
                $.cookie('dumble271207', 'u='+this.currentUser+';t='+this.currentTag, {expires: 365});
                /* Google Analytics */
                pageTracker._trackPageview("/dumble/"+this.currentUser+"/"+this.currentTag); 
            },
    readCookie: function() {
                var prefs = $.cookie('dumble271207');
                if (!prefs) return;
                var data = prefs.split(';');
                for (i=0; i<data.length; i++) {
                    if (data[i].charAt(0)=='u') {
                        this.currentUser = data[i].substring(2, data[i].length);
                    }
                    if (data[i].charAt(0)=='t') {
                        this.currentTag = data[i].substring(2, data[i].length);
                    }
                }
            },
    updatePageFor: function(user, tag) {
                this.currentUser = user;
                this.currentTag = tag ? tag : '';
                this.currentData = [];                
                $('#sourceUser').val(this.currentUser);
                $('#sourceTag').val(this.currentTag);
                $('#permalink').attr('href', this.permalink());
                this.writeCookie();
                this.updatePage();
            },

    insertItems: function() {
            var count = 0;
            while (this.currentData.length > 0) {
                var item = this.currentData.shift();
            
                $.each(Providers, function() {
                    var v = this(item.u, item.d, item.n ? item.n : '');
                    if (v) {
                        $('#dynposts').append(
                            $('<div class="post"></div>\n').hide().prepend(v));
                        count += 1;
                        return false;
                    }
                });
                if (count > 20) {
                    break;
                }
            }
            if (this.currentData.length > 0) {
                $('#previous-next').fadeIn(1000);
            }
            $('.post').fadeIn(3000);
        },

    updateFriends: function() {
        $('#friends-list').fadeOut(1000);
        $('#friends h3').text("Explore {name}'s network".supplant({name: this.currentUser}));
        $('#networklink a').attr('href', 'http://del.icio.us/network?add=' + this.currentUser)
                    .text("Add {name} to your del.icio.us network".supplant({name: this.currentUser}));

        $.getJSON(this.friendsURLFor(this.currentUser) + '?callback=?', 
            function(names) {
                var tgt = $('#friends-list');
                tgt.empty();
                if(names.length > 0) {
                    $.each(names, function(i, name) {
                        var e = $('<li><a href="javascript:Dumble.updatePageFor(\'{name}\');">{name}</a></li>'.supplant({name: name}));
                        tgt.append(e);
                    });
                } else {
                    tgt.text(Dumble.currentUser + "'s network is empty! Is this an anti-social person? ;-)");
                }
                $('#friends-list').fadeIn(1000);
            });
    },
    updatePage:  function(URL) {
        $('body').css({ cursor: 'wait' });
        $('#previous-next').fadeOut(2000);
        
        if (this.currentData.length <= 0) {
            this.updateFriends();
            $('#dynposts').fadeOut(1000).empty().fadeIn(1);
            $.getJSON(URL ? URL : this.currentURL() + '?count=100&callback=?', 
                function(data) {
                    if (data.length > 0) {
                        Dumble.currentData = data;
                        Dumble.insertItems();
                    } else {
                        $('#dynposts').append(
                            $('<div class="post"><h3>No items found :-(</h3></div>\n').hide());
                         $('.post').fadeIn(3000);
                    }
                    $('body').css({ cursor: 'default' });
                });
        } else {
            this.insertItems();
            $('body').css({ cursor: 'default' });
        }
    } 
}

$(document).ready(function() {

    /* Some page setup first */
    $('#about').hide();
    $('#previous-next').hide();

    /* Google Analytics Initialize */    
    var pageTracker = _gat._getTracker("UA-1736551-2");
    pageTracker._initData();
    pageTracker._trackPageview();
    
    /* Is our location URL the base Dumble app url or does it have u=? & t=? */
    var isBaseURL = true;
    
    re_u = /u=(\w+)/i
    re_t = /t=(\w+)/i
    var m = re_u.exec(location.search);
    if (m) {
       Dumble.currentUser = m[1];
       isBaseURL = false;
    }
    m = re_t.exec(location.search);
    if (m) {
       Dumble.currentTag = m[1];
       isBaseURL = false;
    }

    if (isBaseURL) {
        /* The initial page loaded via the root Dumble app url */
        Dumble.readCookie();
    } else {
        /* We came here via a permalink */
        Dumble.writeCookie();
    }

    $('#sourceUser').val(Dumble.currentUser);
    $('#sourceTag').val(Dumble.currentTag);
    $('#permalink').attr('href', Dumble.permalink());

    $('#aboutHeader,#updateSource').hover(
        function() {
            $(this).css({ cursor: 'pointer' });
        }, 
        function() {
            $(this).css({ cursor: 'default' });
        }) 
    $('#aboutHeader').click(
        function() {
         $('#about').slideToggle('fast');
    });

    $('#sourceForm').submit(function() {
         Dumble.updatePageFor($('#sourceUser').val(), $('#sourceTag').val());
         $('#sourceUser').blur(); $('#sourceTag').blur();
         return false;
    });
    
    Dumble.updatePage();

});  /* End $(document).ready() block */
