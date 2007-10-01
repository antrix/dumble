var URLS = new Array("http://www.youtube.com/watch?v=MIayUEi_KGo",
            "http://www.youtube.com/watch?v=1blG15MhFc4",
            "http://www.youtube.com/watch?v=CTnqFm-wUVQ",
            "http://www.youtube.com/watch?v=b-GPJw7UttA&watch_response");

var Providers = new Array();

$(document).ready(
function() {
    for (i in URLS) {
        for (p in Providers) {
            var v = Providers[p](URLS[i]);
            if (v) {
                $("#content").append('<div class="obj">' + v + '</div>').fadeIn('slow');
                break;
            }
        }
    }
}
);


YoutubeProvider = function(url) {
    this.re = /youtube\.com\/watch.+v=([\w-]+)&?/i
    this.template = '<object width="425" height="350"><param name="movie" value="http://www.youtube.com/v/VIDEOID"></param><param name="wmode" value="transparent"></param><embed src="http://www.youtube.com/v/VIDEOID" type="application/x-shockwave-flash" wmode="transparent" width="425" height="350"></embed></object>'

    if (url.match(this.re)) {
        var matches = this.re.exec(url);
        //alert("match: " + matches[1]);
        var elem = this.template.replace(/VIDEOID/g, matches[1]);
        return elem;
    }
    else {
        alert("no match: " + url);
        return false;
    }
}
Providers.push(YoutubeProvider);
