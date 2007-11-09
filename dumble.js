/* var URLS = new Array("http://video.google.com/videoplay?docid=-5418697513610148116",
            "http://www.flickr.com/photos/tnhimmies/1468837710/",
            "http://www.flickr.com/photos/crafty_beaver/1468811180/",
            "http://video.google.com/videoplay?docid=1927769265420370554",
            "http://www.youtube.com/watch?v=MIayUEi_KGo",
            "http://www.youtube.com/watch?v=CTnqFm-wUVQ",
            "http://www.youtube.com/watch?v=b-GPJw7UttA&watch_response"); */

var Providers = new Array();

Providers.push(YoutubeProvider);
Providers.push(GoogleVideoProvider);
Providers.push(FlickrProvider);
Providers.push(AmazonProvider); 
Providers.push(GenericImageProvider);
Providers.push(GenericLinkProvider); /* Should be last in the array! */

var Dumble = Dumble ? Dumble : {
    currentUser: 'antrix',
    currentTag: 'linker',
    currentData: [],
    currentURL: function() {
            return this.urlFor(this.currentUser, this.currentTag);
            },
    urlFor: function(user, tag) {
                return 'http://del.icio.us/feeds/json/' + user + '/' + tag;
            },
    updatePageFor: function(user, tag) {
                this.currentUser = user;
                this.currentTag = tag;
                this.currentData = [];
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

    updatePage:  function(URL) {
        $('body').css({ cursor: 'wait' });
        $('#previous-next').fadeOut(2000);
        
        if (this.currentData.length <= 0) {
            $('#dynposts').fadeOut(1000).empty().fadeIn(1);
            $.getJSON(URL ? URL : this.currentURL() + '?count=100&callback=?', 
                function(data) {
                    Dumble.currentData = data;
                    Dumble.insertItems();
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
    $('#sourceUser').val(Dumble.currentUser);
    $('#sourceTag').val(Dumble.currentTag);

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
    $('#updateSource').click(
        function() {
         Dumble.updatePageFor($('#sourceUser').val(), $('#sourceTag').val());
    });
    
    
    Dumble.updatePage();

});  /* End $(document).ready() block */
