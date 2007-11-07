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
Providers.push(GenericLinkProvider); /* Should be last in the array! */

$(document).ready(function() {
    $.getJSON('http://del.icio.us/feeds/json/antrix/linker?count=20&callback=?',
        function(data) {
            $.each(data, function(i, item) {
                $.each(Providers, function() {
                    var v = this(item.u, item.d, item.n ? item.n : '');
                    if (v) {
                        $("#posts").append(
                            $('<div class="post"></div>\n').hide().prepend(v));
                        return false;
                    }
                });

            });
          $('.post').fadeIn(5000);
        }); /* getJSON */

});  /* End $(document).ready() block */
