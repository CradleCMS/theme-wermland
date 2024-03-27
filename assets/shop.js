
if ((typeof shop) == 'undefined') {
	var shop = {};
}
shop.queryParams = {};
if (location.search.length) {
  for (var aKeyValue, i = 0, aCouples = location.search.substr(1).split('&'); i < aCouples.length; i++) {
    aKeyValue = aCouples[i].split('=');
    if (aKeyValue.length > 1) {
      shop.queryParams[decodeURIComponent(aKeyValue[0])] = decodeURIComponent(aKeyValue[1]);
    }
  }
}
/*
$(function() {

    $(".side-menu--toggle").on("click", function(e) {
        e.preventDefault();
        $("body").addClass("side-menu--open").removeClass("side-menu--closed");
    });
    
    $("body").on('click', 'a.add-to-cart:not(".sold-out"), button.add-to-cart:not(".sold-out"), input.add-to-cart:not(".sold-out"), #add:not(".sold-out")', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var quantityValue = $(this).closest("form").find(".quantity-selector").val();
        var variant_id = $(this).attr('data-variant-id') || document.forms['cart_add'].id.value;
        var quantity = quantityValue || 1;

        $(".product-addon input").each(function() {
            if ($(this).is(":checked")) {
                AJAXcart.add($(this).val(), 1);
            }
        });
        
        AJAXcart.add(variant_id, quantity);
        $("body").addClass("cart-open");
        //imgToCart($(this));
    });
    
    $(".modal-background, .close-menu").on("click", function(e) {
        e.preventDefault();
        $("body").removeClass("side-menu--open").addClass("side-menu--closed");
    });
    
    $(".nav-header, .close-menu").on("click", function(e) {
    e.preventDefault();
    $("body").removeClass("side-menu--open").addClass("side-menu--closed");
    });
    
    
    $(".linklist > a").on("click", function(e) {
        e.preventDefault();
        $(".linklist > a").removeClass("active--menu");
        if ($(this).attr("href")) {
            $(this).addClass("active--menu");
        }
    });
    
    // Make order summary sticky on custom checkout and thank you page.
    if (($('html.lt-ie9').length < 1) && ($(window).width() >= 769) && ($('.sticky').length > 0)) {
        //Don't make sticky if IE9 or device is small
        $(window).on('load', function() {
            $('.sticky').stick_in_parent({
                'parent':$('#checkout-grid'),
                'offset_top':24 
            });
        })
    }

    var permalink = $('.social-sharing').attr('data-permalink');
    if ($('.share-facebook').length ) {
        $.getJSON('https://graph.facebook.com/?id=' + permalink + '&callback=?', function(data) {
            if (data.shares) {
                $('.share-facebook .share-count').text(data.shares).addClass('is-loaded');
            } else {
                $('.share-facebook .share-count').remove();
            }
        });
    };

    if ($('.share-twitter').length ) {
        $.getJSON('https://cdn.api.twitter.com/1/urls/count.json?url=' + permalink + '&callback=?', function(data) {
            if (data.count > 0) {
                $('.share-twitter .share-count').text(data.count).addClass('is-loaded');
            } else {
                $('.share-twitter .share-count').remove();
            }
        });
    };

    if ($('.share-pinterest').length ) {
        $.getJSON('https://api.pinterest.com/v1/urls/count.json?url=' + permalink + '&callback=?', function(data) {
            if (data.count > 0) {
                $('.share-pinterest .share-count').text(data.count).addClass('is-loaded');
            } else {
                $('.share-pinterest .share-count').remove();
            }
        });
    };

    if ($('.share-google').length ) {
        $.getJSON('https://apps.pandacommerce.net/applications/app-social-discount/gplusshares.php?url='+permalink, function(data) {
            if (data.shares > 0) {
                $('.share-google').find('.share-count').text(data.shares).addClass('is-loaded');
            } else {
                $('.share-google .share-count').remove();
            }
        });
    }
    $('.social-sharing a').on('click', function(e) {
        e.preventDefault();
        var el = $(this),
            popup = el.attr('class').replace('-','_'),
            link = el.attr('href'),
            w = 700,
            h = 400;
    
        // Set popup sizes
        switch (popup) {
          case 'share-twitter':
            h = 300;
            break;
          case 'share-fancy':
            w = 480;
            h = 720;
            break;
          case 'share-google':
            w = 500;
            break;
        }
    
        window.open(link, popup, 'width=' + w + ', height=' + h);
    });
    
    
    //Make Youtube and Vimeo embeds responsive
    $('iframe[src*="youtube.com/embed"]').wrap('<div class="video-wrapper"></div>');
    $('iframe[src*="player.vimeo"]').wrap('<div class="video-wrapper"></div>');
    
    
    //Quantity Selector
    $('.quantity-selector').addClass('input-group-field').css({'border-radius':0}).wrap('<div class="input-group quantity-selector-wrapper"></div>');
    $('.quantity-selector').parent().prepend('<span class="input-group-btn"><a class="btn" data-type="minus">-</a></span>').append('<span class="input-group-btn"><a class="btn" data-type="plus">+</a></span>')
    
    $('.quantity-selector-wrapper .btn').on('click', function() {
        var input = $(this).parent().parent().find('input');
        var min = parseInt(input.attr('min'));
        var max = parseInt(input.attr('max'));
        
        if (isNaN(min)) {
            min = 1;
        }
        if (isNaN(max)) {
            max = null;
        }
        var newVal = parseInt(input.val());
        if ($(this).attr('data-type') == 'minus') {
            newVal--;
            if (newVal < min) {
                newVal = min;
            }
        }
        else {
            newVal++;
            if ((newVal > max) && (max !== null)) {
                newVal = max;
            }
        }
        input.val(newVal);
    });
    
    //Modal overlay
    $('<div/>', {
        'id':'modal-overlay'
    }).appendTo($('body')).on('click', hideModal);
    $('.modal .modal--content').prepend('<a class="modal--close"><i class="panda-icon-ui-close"></i></a>');
    $('.modal .modal--close').on('click', hideModal);
});
*/

