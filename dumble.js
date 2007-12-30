String.prototype.supplant = function (o) {
    /* http://javascript.crockford.com/remedial.html */
    return this.replace(/{([^{}]*)}/g,
        function (a, b) {
            var r = o[b];
            return typeof r === 'string' || typeof r === 'number' ? r : a;
        }
    );
};

var DEBUG = true;
if (location.host.toLowerCase() == 'antrix.net') {
    DEBUG = false;
}

var Providers = new Array();

$.getScript("dumble-providers.js", function() {
    Providers.push(YoutubeProvider);
    Providers.push(GoogleVideoProvider);
    Providers.push(CollegeHumorProvider);
    Providers.push(FlickrProvider);
    Providers.push(AmazonProvider); 
    Providers.push(IMDbProvider);
    Providers.push(FunnyOrDieProvider);
    Providers.push(GenericImageProvider);
    Providers.push(GenericLinkProvider); /* Should be last in the array! */
});

var Analytics = Analytics ? Analytics : {
    pageTracker: null,
    init: function(page) {
        if (DEBUG) {return}
        $.getScript("http://www.google-analytics.com/ga.js", function(page) {
            Analytics.pageTracker = _gat._getTracker("UA-1736551-2");
            Analytics.pageTracker._initData();
            if(page) { Analytics.trackPage(page); }
        });
    },
    trackPage: function(page) {
        if (DEBUG) {return}
        if (!this.pageTracker) {
            this.init(page);
        } else {
            this.pageTracker._trackPageview(page);
        }
    }
}

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
    tagsURLFor: function(user) {
                return 'http://del.icio.us/feeds/json/tags/' + user;
            },
    permalink: function(user, tag) {
                if(!user) {user = this.currentUser}
                if(!tag && user == this.currentUser)  {tag = this.currentTag}
                return location.protocol + '//' + location.host + location.pathname + '?u=' + user
                  + (tag ? '&t=' + tag : '');
            },
    writeCookie: function() {
                $.cookie('dumble271207', 'u='+this.currentUser+';t='+this.currentTag, {expires: 365});
                /* Google Analytics */
                Analytics.trackPage("/dumble/"+this.currentUser+"/"+this.currentTag); 
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
                if (typeof _lastUser == 'undefined' || _lastUser != user) {
                    _lastUser = user;
                    this.currentUser = user;
                    this.updateFriends();
                    this.updateTags();
                }
                this.currentTag = tag ? tag : '';
                this.currentData = [];                
                $('#sourceUser').val(this.currentUser);
                $('#sourceTag').val(this.currentTag);
                $('#permalink').attr('href', this.permalink());
                this.writeCookie();
                this.updateHistory();
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

    updateHistory: function() {
        var string = this.currentUser + (this.currentTag ? '/' + this.currentTag : '');
        var e = $('<li><a href="{l}" onClick="javascript:Dumble.updatePageFor(\'{n}\', \'{t}\');return false;">'.supplant({n: this.currentUser, t: this.currentTag, l: this.permalink()})
                     +string+ '</a></li>');
        $('#history ul').prepend(e);

        if ($('#history ul li').length == 2) {
            $('#history ul').slideDown('fast');
            $('#history-clear').show();
            $('#history').fadeIn('slow');
        }
    },

    updateTags: function() {
        $('#tags-list').fadeOut(1000);
        $('#tags h3').text("{name}'s top tags".supplant({name: this.currentUser}));
        
        $.getJSON(this.tagsURLFor(this.currentUser) + '?count=20&sort=count&callback=?', 
            function(tags) {
                var tgt = $('#tags-list');
                tgt.empty();
                if(tags) { /* Delicious returns tags as {tag1: count1, 'foo': 20, 'bar': 30} */
                    $.each(tags, function(tag, count) {
                        var e = $('<li><a href="' +Dumble.permalink(Dumble.currentUser, tag)+ '" onClick="javascript:Dumble.updatePageFor(\'{name}\', \'{tag}\');return false;">{tag}</a></li>'.supplant({name: Dumble.currentUser, tag: tag}));
                        tgt.append(e);
                    });
                }
                if(tgt.html() == '') {
                    tgt.text(Dumble.currentUser + " hasn't tagged any links!");
                }
                $('#tags-list').fadeIn(1000);
            });
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
                        var e = $('<li><a href="' +Dumble.permalink(name)+ '" onClick="javascript:Dumble.updatePageFor(\'{name}\');return false;">{name}</a></li>'.supplant({name: name}));
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
                    $('#about').slideUp('fast');
                    $('body').css({ cursor: 'default' });
                });
        } else {
            this.insertItems();
            $('body').css({ cursor: 'default' });
        }
    } 
}  /* End Dumble namespace */

$(document).ready(function() {

    /* Some page setup first */
    $('#about').hide();
    $('#previous-next').hide();
    $('#history').hide();

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
    } 

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
    
    Dumble.updatePageFor(Dumble.currentUser, Dumble.currentTag);

});  /* End $(document).ready() block */
