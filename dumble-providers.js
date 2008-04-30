MetacafeProvider = function(url, caption, notes) {
    this.re = /metacafe\.com\/watch\/(\d+)\/.+/i
    this.template = '<div class="video"><embed src="http://www.metacafe.com/fplayer/{videoid}/movie.swf" style="width:400px; height:345px;" wmode="transparent" type="application/x-shockwave-flash"></embed><span class="caption">{caption}</span>{notes}</div>'

    var matches = this.re.exec(url);
    if (!matches) {
        return false;
    }

    var elem = this.template.supplant({videoid: matches[1], caption: caption, notes: notes});
    return $(elem);
}

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
    this.template = '<div class="video"><embed style="width:400px; height:326px;" type="application/x-shockwave-flash" src="http://video.google.com/googleplayer.swf?docId={videoid}&hl=en" flashvars=""></embed><span class="caption">{caption}</span>{notes}</div>'

    var matches = this.re.exec(url);
    if (!matches) {
        return false;
    }

    var elem = this.template.supplant({videoid: matches[1], caption: caption, notes: notes});
    return $(elem);
}

CollegeHumorProvider = function(url, caption, notes) {
    this.re = /collegehumor\.com\/video:([\d]+)/i
    this.template = '<div class="video"><embed style="width:480px; height:360px;" type="application/x-shockwave-flash" src="http://www.collegehumor.com/moogaloop/moogaloop.swf?clip_id={videoid}&fullscreen=1" ></embed><span class="caption">{caption}</span>{notes}</div>'

    var matches = this.re.exec(url);
    if (!matches) {
        return false;
    }

    var elem = this.template.supplant({videoid: matches[1], caption: caption, notes: notes});
    return $(elem);
}

AmazonProvider = function(url, caption, notes) {
    this.re = /amazon\.(?:com|co\.uk|de|ca|jp)\/.*\/?(?:gp\/product|o\/ASIN|obidos\/ASIN|dp)\/(\w{8,11})[\/\?]?/i
    
    var matches = this.re.exec(url);
    if (!matches) {
        return false;
    }

    var a = $('<a />').attr('href', url).attr('target', '_blank');
    var img = $('<img />').attr('src', 'http://images.amazon.com/images/G/01/x-locale/browse/upf/amzn-logo-5.gif');
    a.append(img);
    var elem = $('<div class="photo"></div>');
    elem.append(a);
    elem.append('<span class="caption">'+ caption +'</span>' + notes);
    
    // NOTE: The img object will be returned immediately as getJSON is an async call
    // The img object's ref is saved in the following closure so it'll get updated in main
    // document when the json callback manipulates the img ref
    $.getJSON('http://xml-us.amznxslt.com/onca/xml?Service=AWSECommerceService&SubscriptionId=1FTX8DJ3D0NCX9DRWQR2&AssociateTag=antrixnet-20&Operation=ItemLookup&ResponseGroup=Images&Style=http://antrix.net/dumble/ajsonSingleAsin.xsl&ContentType=text/javascript&IdType=ASIN&ItemId=' + matches[1] + '&CallBack=?', function(data) {
        if (data.Item.largeimgurl.length) {
            img.attr("src", data.Item.largeimgurl.replace(/(.*)\.jpg$/i, '$1._SX240_.jpg'));
            img.attr("width", 240);
        }
    });
    
    return elem;
}

IMDbProvider = function(url, caption, notes) {
    this.re = /imdb\.com\/title\/tt\d{7,7}\//i
    this.template = '<div class="link"><h3><a href="{url}" target="_blank">{caption}</a></h3></div>'

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

    var a = $('<a />').attr('href', url).attr('target', '_blank');
    var img = $('<img />').attr('src', 'http://l.yimg.com/www.flickr.com/images/flickr_logo_gamma.gif.v1.5.10');
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

TwitterProvider = function(url, caption, notes) {
    this.re = /twitter\.com\/(\w+)\/statuses\/(\d+)/i

    var matches = this.re.exec(url);
    if (!matches) {
        return false;
    }

    var elem = $('<div class="quote"></div>');

    $.getJSON('http://twitter.com/statuses/show/' + matches[2] + '.json?callback=?', 
        function(data) {
            var t = '&#8220;{status}&#8221;&nbsp;&nbsp;<span class="source"><a href="{url}" target="_blank">tweeted {user}</a></span>';
            elem.html(t.supplant({status: (data.text?data.text:caption), url: url, 
                    user: (data.user.screen_name ? data.user.screen_name : matches[1])}));
        });
    return elem;
}

WikipediaProvider = function(url, caption, notes) {
    this.re = /en\.wikipedia\.org\/wiki\/([-\w\.]+)/i
    var matches = this.re.exec(url);
    if (!matches) {
        return false;
    }

    this.template = '<div class="regular"><h3><a href="{url}" target="_blank">{caption}</a></h3>{notes}</div>'

    var elem = $(this.template.supplant({url: url, caption: caption, notes: notes}));
    var content = $('<div/>');
    elem.append(content);

    $.getJSON('http://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content' 
              + '&rvsection&format=json&titles='+matches[1]+'&callback=?', 
        function(data) {
            for (page in data.query.pages) {
                p = data.query.pages[page]
                wikitext = p.revisions[0]['*'];
                htmltext = wiki2html(wikitext);
                content.html('<blockquote>'+htmltext+'</blockquote>');
                break;
            }
        });
    return elem;
}

FunnyOrDieProvider = function(url, caption, notes) {
    this.re = /funnyordie\.com\/videos\/(\w+)/i
    this.template = '<div class="video"><embed width="464" height="388" flashvars="key={videoid}" allowfullscreen="true" quality="high" src="http://www2.funnyordie.com/public/flash/fodplayer.swf?1194729277" type="application/x-shockwave-flash"></embed><span class="caption">{caption}</span>{notes}</div>'

    var matches = this.re.exec(url);
    if (!matches) {
        return false;
    }

    var elem = this.template.supplant({videoid: matches[1], caption: caption, notes: notes});
    return $(elem);
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
    this.template = '<div class="link"><h3><a href="{url}" target="_blank">{caption}</a></h3>{notes}</div>'

    var elem = this.template.supplant({url: url, caption: caption, notes: notes});
    return $(elem);
}
