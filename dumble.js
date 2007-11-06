var URLS = new Array("http://www.youtube.com/watch?v=MIayUEi_KGo",
            "http://www.flickr.com/photos/tnhimmies/1468837710/",
            "http://www.flickr.com/photos/crafty_beaver/1468811180/",
            "http://video.google.com/videoplay?docid=1927769265420370554",
            "http://video.google.com/videoplay?docid=-5418697513610148116",
            "http://www.youtube.com/watch?v=CTnqFm-wUVQ",
            "http://www.youtube.com/watch?v=b-GPJw7UttA&watch_response");

var Providers = new Array();

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
                    $('<div class="post"></div>').prepend(v));
                break;
            }
        }
    }
//     $('.video').show('slow');
    $('.photo img').fadeIn('slow');
}
);


YoutubeProvider = function(url) {
    this.re = /youtube\.com\/watch.+v=([\w-]+)&?/i
    this.template = '<div class="video"><embed src="http://www.youtube.com/v/{videoid}" type="application/x-shockwave-flash" wmode="transparent" width="425" height="355"></embed></div>'

    var matches = this.re.exec(url);
    if (matches) {
        //alert("youtubematch: " + matches[0]);
        var elem = this.template.supplant({videoid: matches[1]});
        return $(elem);
    }
    else {
        return false;
    }
}
Providers.push(YoutubeProvider);

GoogleVideoProvider = function(url) {
    this.re = /video\.google\.com\/videoplay.+docid=([\d-]+)&?/i
    this.template = '<div class="video"><embed style="width:400px; height:326px;" id="VideoPlayback" type="application/x-shockwave-flash" src="http://video.google.com/googleplayer.swf?docId={videoid}&hl=en" flashvars=""> </embed></div>'

    var matches = this.re.exec(url);
    if (matches) {
        //alert("googvideomatch: " + matches[0]);
        var elem = this.template.supplant({videoid: matches[1]});
        return $(elem);
    }
    else {
        return false;
    }
}
Providers.push(GoogleVideoProvider);

FlickrProvider = function(url) {
    this.re = /flickr.com\/photos\/.+\/(\d+)\//i
    this.template = '<a href="{url}"><img src="{source}" width="{width}" height="{height}" /></a>'

    var matches = this.re.exec(url);
    if (matches) {
        //alert("flickrmatch: " + matches[1]);
        //return "fetching: " + "http://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=9baf1fe6daf86b0602b1ca31f7a83688&photo_id=" + matches[1] + "&format=json&jsoncallback=?";
        
        var a = $('<a />').attr('href', url);
        var img = $('<img />').attr('src', 'localhost').attr('display', 'none');
        a.prepend(img);
        var div = $('<div class="photo"></div>');
        div.prepend(a);
        
        // NOTE: The img object will be returned immediately as getJSON is an async call
        // The img object's ref is saved in the following closure so it'll get updated in main
        // document when the json callback manipulates the img ref
        $.getJSON("http://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=9baf1fe6daf86b0602b1ca31f7a83688&photo_id=" 
                    + matches[1] + "&format=json&jsoncallback=?", function(data) {
           
            $.each(data.sizes.size, function(i, item) {
                if (item.label == 'Medium') {
                    img.attr("src", item.source);
                    img.attr("width", item.width);
                    img.attr("height", item.height);
                    return false;
                }
            });
          });
        return div;
    }
    else {
        return false;
    }
}
Providers.push(FlickrProvider);