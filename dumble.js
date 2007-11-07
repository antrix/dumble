var URLS = new Array("http://video.google.com/videoplay?docid=-5418697513610148116",
            "http://www.flickr.com/photos/tnhimmies/1468837710/",
            "http://www.flickr.com/photos/crafty_beaver/1468811180/",
            "http://video.google.com/videoplay?docid=1927769265420370554",
            "http://www.youtube.com/watch?v=MIayUEi_KGo",
            "http://www.youtube.com/watch?v=CTnqFm-wUVQ",
            "http://www.youtube.com/watch?v=b-GPJw7UttA&watch_response");

var Providers = new Array();

Providers.push(YoutubeProvider);
Providers.push(GoogleVideoProvider);
Providers.push(FlickrProvider);

String.prototype.supplant = function (o) {
    /* http://javascript.crockford.com/remedial.html */
    return this.replace(/{([^{}]*)}/g,
        function (a, b) {
            var r = o[b];
            return typeof r === 'string' || typeof r === 'number' ? r : a;
        }
    );
};

$(document).ready(
function() {

    for (i in URLS) {
        for (p=0; p<Providers.length; p++) {
            var v = Providers[p](URLS[i]);
            if (v) {
                $("#posts").append(
                    $('<div class="post"></div>').prepend(v).hide().fadeIn(1000));
                break;
            }
        }
    }
}
);

