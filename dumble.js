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
Providers.push(GenericLinkProvider); /* Should be last in the array! */

var Delicious = Delicious ? Delicious : {
    currentUser: 'antrix',
    currentTag: 'linker',
    currentURL: function() {
            return this.urlFor(this.currentUser, this.currentTag);
            },
    urlFor: function(user, tag) {
                return 'http://del.icio.us/feeds/json/' + user + '/' + tag;
            },
    updatePageFor: function(user, tag) {
                this.currentUser = user;
                this.currentTag = tag;
                this.updatePage();
            },
    updatePage:  function(URL) {

        $('body').css({ cursor: 'wait' });
    
        $.getJSON(URL ? URL : this.currentURL() + '?count=20&callback=?',
        function(data) {
            $('#dynposts').fadeOut(1000).empty().fadeIn(1);
            $.each(data, function(i, item) {
                $.each(Providers, function() {
                    var v = this(item.u, item.d, item.n ? item.n : '');
                    if (v) {
                        $('#dynposts').append(
                            $('<div class="post"></div>\n').hide().prepend(v));
                        return false;
                    }
                });
        
            });
            $('.post').fadeIn(3000);
            $('body').css({ cursor: 'default' });
        });
    }
}

$(document).ready(function() {

    /* Some page setup first */
    $('#about').hide();
    $('#sourceUser').val(Delicious.currentUser);
    $('#sourceTag').val(Delicious.currentTag);

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
         Delicious.updatePageFor($('#sourceUser').val(), $('#sourceTag').val());
    });
    
    
//     Delicious.updatePage();

});  /* End $(document).ready() block */
