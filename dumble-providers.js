String.prototype.supplant = function (o) {
    /* http://javascript.crockford.com/remedial.html */
    return this.replace(/{([^{}]*)}/g,
        function (a, b) {
            var r = o[b];
            return typeof r === 'string' || typeof r === 'number' ? r : a;
        }
    );
};

YoutubeProvider = function(url, caption, notes) {
    this.re = /youtube\.com\/watch.+v=([\w-]+)&?/i
    this.template = '<div class="video"><embed src="http://www.youtube.com/v/{videoid}" type="application/x-shockwave-flash" wmode="transparent" style="width:425px; height:355px;"></embed><span class="caption">{caption}</span>{notes}</div>'

    var matches = this.re.exec(url);
    if (!matches) {
        return false;
    }

    var elem = this.template.supplant({videoid: matches[1], caption: caption, notes: notes});
    return $(elem);
}

GoogleVideoProvider = function(url, caption, notes) {
    this.re = /video\.google\.com\/videoplay.+docid=([\d-]+)&?/i
    this.template = '<div class="video"><embed style="width:400px; height:326px;" id="VideoPlayback" type="application/x-shockwave-flash" src="http://video.google.com/googleplayer.swf?docId={videoid}&hl=en" flashvars=""></embed><span class="caption">{caption}</span>{notes}</div>'

    var matches = this.re.exec(url);
    if (!matches) {
        return false;
    }

    var elem = this.template.supplant({videoid: matches[1], caption: caption, notes: notes});
    return $(elem);
}

AmazonProvider = function(url, caption, notes) {
    this.re = /amazon\.com\/.*\/?(?:gp\/product|o\/ASIN|obidos\/ASIN|dp)\/(\d{7,10}[\dX])[\/\?]?/i
    this.template = '<div class="photo"><a href="{url}"><img src="http://images.amazon.com/images/P/{asin}.01._SCLZZZZZZZ_.jpg" alt="{caption}" title="{caption}" /></a><span class="caption">{caption}</span>{notes}</div>'
    
    var matches = this.re.exec(url);
    if (!matches) {
        return false;
    }

    var elem = this.template.supplant({asin: matches[1], caption: caption, notes: notes, url: url});
    return $(elem);
}

IMDbProvider = function(url, caption, notes) {
    this.re = /imdb\.com\/title\/tt\d{7,7}\//i
    this.template = '<div class="link"><h3><a href="{url}" target="blank">{caption}</a></h3></div>'

    var matches = this.re.exec(url);
    if (!matches) {
        return false;
    }

    var ratings_re = /(\d{1,2}) ?\/ ?(\d{1,2})/i
    var ratings = ratings_re.exec(notes);

    var elem = $(this.template.supplant({url: url, caption: caption}));

    if (ratings && (parseInt(ratings[1]) <= parseInt(ratings[2]))) {
        stars = $('<img />')
                   .attr("src", 'images/' + Math.round(5*ratings[1]/ratings[2]) + '_stars.png')
                   .attr("height", 16);
        elem.append(stars)
    }

    return elem;
}

FlickrProvider = function(url, caption, notes) {
    this.re = /flickr\.com\/photos\/[\w@]+\/(\d+)\//i

    var matches = this.re.exec(url);
    if (!matches) {
        return false;
    }

    var a = $('<a />').attr('href', url);
    var img = $('<img />').attr('src', 'localhost');
    a.append(img);
    var elem = $('<div class="photo"></div>');
    elem.append(a);
    elem.append('<span class="caption">'+ caption +'</span>' + notes);
    
    // NOTE: The img object will be returned immediately as getJSON is an async call
    // The img object's ref is saved in the following closure so it'll get updated in main
    // document when the json callback manipulates the img ref
    $.getJSON('http://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=9baf1fe6daf86b0602b1ca31f7a83688&photo_id=' 
                + matches[1] + '&format=json&jsoncallback=?', function(data) {
    
        $.each(data.sizes.size, function(i, item) {
            if (item.label == 'Medium') {
                img.attr("src", item.source);
                img.attr("width", item.width);
                img.attr("height", item.height);
                return false;
            }
        });
    });
    return elem;
}

GenericImageProvider = function(url, caption, notes) {
    this.re = /.*(jpeg|jpg|png|bmp|gif)$/i
    this.template = '<div class="photo"><img src="{url}" alt="{caption}" title="{caption}" /><span class="caption">{caption}</span>{notes}</div>'
    
    var matches = this.re.exec(url);
    if (!matches) {
        return false;
    }

    var elem = this.template.supplant({url: url, caption: caption, notes: notes});
    return $(elem);
}

GenericLinkProvider = function(url, caption, notes) {
    this.template = '<div class="link"><h3><a href="{url}" target="blank">{caption}</a></h3>{notes}</div>'

    var elem = this.template.supplant({url: url, caption: caption, notes: notes});
    return $(elem);
}
