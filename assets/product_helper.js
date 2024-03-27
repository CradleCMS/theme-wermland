if (typeof shop == "undefined") {
  var shop = {};
}

// ---------------------------------------------------------------------------
// shop generic helper methods
// ---------------------------------------------------------------------------
shop.each = function(ary, callback) {
  for (var i = 0; i < ary.length; i++) {
    callback(ary[i], i);
  }
};

shop.map = function(ary, callback) {
  var result = [];
  for (var i = 0; i < ary.length; i++) {
    result.push(callback(ary[i], i));
  }
  return result;
};
shop.bind = function(fn, scope) {
  return function() {
    return fn.apply(scope, arguments);
  };
};
shop.arrayIncludes = function(ary, obj) {
  for (var i = 0; i < ary.length; i++) {
    if (ary[i] == obj) {
      return true;
    }
  }
  return false;
};

shop.uniq = function(ary) {
  var result = [];
  for (var i = 0; i < ary.length; i++) {
    if (!shop.arrayIncludes(result, ary[i])) {
      result.push(ary[i]);
    }
  }
  return result;
};

shop.isDefined = function(obj) {
  return typeof obj == "undefined" ? false : true;
};

shop.getClass = function(obj) {
  return Object.prototype.toString.call(obj).slice(8, -1);
};

shop.extend = function(subClass, baseClass) {
  function inheritance() {}
  inheritance.prototype = baseClass.prototype;

  subClass.prototype = new inheritance();
  subClass.prototype.constructor = subClass;
  subClass.baseConstructor = baseClass;
  subClass.superClass = baseClass.prototype;
};
shop.addListener = function(target, eventName, callback) {
  target.addEventListener
    ? target.addEventListener(eventName, callback, false)
    : target.attachEvent("on" + eventName, callback);
};
shop.urlParam = function(name) {
  var match = RegExp("[?&]" + name + "=([^&]*)").exec(window.location.search);
  return match && decodeURIComponent(match[1].replace(/\+/g, " "));
};

/*
   money_format can be:
  
   {{ shop.money_format }}
   {{ shop.money_with_currency_format }}
   {{ shop.money_without_currency_format }}
  
   Manually: 
   shop.money(352.34, '€{{amount}} EUR');
   */
shop.money = function(amount, money_format) {
  var pattern = /\{\{\s*(\w+)\s*\}\}/,
    value;

  function addSpaces(money) {
    money = money.replace(/(\d+)(\d{3}[\. ]?)/g, "$1 $2");
    money = money.replace(/(\d+)(\d{3}[\. ]?)/g, "$1 $2");
    money = money.replace(/(\d+)(\d{3}[\. ]?)/g, "$1 $2");
    return money;
  }

  switch (money_format.match(pattern)[1]) {
    case "amount":
      value = addSpaces(
        parseFloat(amount)
          .toFixed(2)
          .toString()
      );
      break;
    case "amount_no_decimals":
      value = addSpaces(
        parseFloat(amount)
          .toFixed(0)
          .toString()
      );
      break;
  }
  return money_format.replace(pattern, value);
};

shop.resizeImage = function(image, size, crop) {
  var src, sizeStr;

  if (typeof crop != "boolean") {
    crop = false;
  }
  if (typeof image == "string") {
    src = image;
  } else if (typeof image.src == "string") {
    src = image.src;
  }

  try {
    if (size == "original") {
      return src;
    } else {
      if (size == "pico") {
        sizeStr = "_16_16";
      } else if (size == "icon") {
        sizeStr = "_32_32";
      } else if (size == "thumb") {
        sizeStr = "_50_50";
      } else if (size == "small") {
        sizeStr = "_100_100";
      } else if (size == "compact") {
        sizeStr = "_160_160";
      } else if (size == "medium") {
        sizeStr = "_240_240";
      } else if (size == "large") {
        sizeStr = "_480_480";
      } else if (size == "grande") {
        sizeStr = "_750_750";
      } else {
        sizeStr = "_" + size + "_" + size;
      }

      if (crop) {
        sizeStr += "_cropped";
      }
      var matches = src.match(/(.*\/[\w\-\_\.]+)\.(\w{2,4})/);
      return matches[1] + sizeStr + "." + matches[2];
    }
  } catch (e) {
    return src;
  }
};

// ---------------------------------------------------------------------------
// shop Product object
// JS representation of Product
// ---------------------------------------------------------------------------
shop.Product = function(json) {
  if (shop.isDefined(json)) {
    this.update(json);
  }
};

shop.Product.prototype.update = function(json) {
  for (var property in json) {
    this[property] = json[property];
  }
};

// returns array of option names for product
shop.Product.prototype.optionNames = function() {
  return Object.keys(this.options);
};

// returns array of all option values (in order) for a given option name index
shop.Product.prototype.optionValues = function(key) {
  if (!this.variants) {
    return null;
  }
  var results = this.variants.map( m => { return m.options[key] });
  console.log("results", results);
  return shop.uniq(results);
};

// return the variant object if exists with given values, otherwise return null
shop.Product.prototype.getVariant = function(selectedValues) {
  var found = null;
  if (selectedValues.length != this.options.length) {
    return found;
  }

  shop.each(this.variants, function(variant) {
    var satisfied = true;
    for (var j = 0; j < selectedValues.length; j++) {
        console.log("selectedValues option_col", option_col, variant.options);
      var option_col = "option" + (j + 1);
      if (
        variant.options[option_col] !== null &&
        variant.options[option_col] != selectedValues[j]
      ) {
        satisfied = false;
      }
    }
    if (satisfied == true) {
      found = variant;
      return;
    }
  });
  return found;
};

shop.Product.prototype.getVariantById = function(id) {
  for (var i = 0; i < this.variants.length; i++) {
    var variant = this.variants[i];

    if (id == variant.id) {
      return variant;
    }
  }

  return null;
};

// ---------------------------------------------------------------------------
// OptionSelectors(domid, options)
//
// ---------------------------------------------------------------------------
shop.OptionSelectors = function(existingSelectorId, options) {
  this.selectorDivClass = "selector-wrapper";
  this.selectorClass = "single-option-selector";
  this.variantIdFieldIdSuffix = "-variant-id";

  this.variantIdField = null;
  this.historyState = null;
  this.selectors = [];
  this.domIdPrefix = existingSelectorId;
  this.product = new shop.Product(options.product);
  this.alwaysDisplayLabel = false;
  this.onVariantSelected = shop.isDefined(options.onVariantSelected)
    ? options.onVariantSelected
    : function() {};

  this.replaceSelector(existingSelectorId); // create the dropdowns
  this.initDropdown();

  if (options.alwaysDisplayLabel) {
    this.alwaysDisplayLabel = options.alwaysDisplayLabel;
  }

  if (options.enableHistoryState) {
    this.historyState = new shop.OptionSelectors.HistoryState(this);
  }

  return true;
};

shop.OptionSelectors.prototype.initDropdown = function() {
  var options = { initialLoad: true };
  var successDropdownSelection = this.selectVariantFromDropdown(options);

  if (!successDropdownSelection) {
    var self = this;
    setTimeout(function() {
      if (!self.selectVariantFromParams(options)) {
        self.fireOnChangeForFirstDropdown.call(self, options);
      }
    });
  }
};

shop.OptionSelectors.prototype.fireOnChangeForFirstDropdown = function(option) {
  this.selectors[0].element.onchange(options);
};

shop.OptionSelectors.prototype.selectVariantFromParamsOrDropdown = function(options) {
  var success = this.selectVariantFromParams(options);

  if (!success) {
    this.selectVariantFromDropdown(options);
  }
};

// insert new multi-selectors and hide original selector
shop.OptionSelectors.prototype.replaceSelector = function(domId) {
  var oldSelector = document.getElementById(domId);
  var parent = oldSelector.parentNode;
  shop.each(this.buildSelectors(), function(el) {
    parent.insertBefore(el, oldSelector);
  });
  oldSelector.style.display = "none";
  this.variantIdField = oldSelector;
};

shop.OptionSelectors.prototype.selectVariantFromDropdown = function(options) {
  var option = document.getElementById(this.domIdPrefix).querySelector("[selected]");

  if (!option) {
    return false;
  }

  var variantId = option.value;
  return this.selectVariant(variantId, options);
};

shop.OptionSelectors.prototype.selectVariantFromParams = function(options) {
  var variantId = shop.urlParam("variant");
  return this.selectVariant(variantId, options);
};

shop.OptionSelectors.prototype.selectVariant = function(variantId, options) {
  var variant = this.product.getVariantById(variantId);

  if (variant == null) {
    return false;
  }

  for (var i = 0; i < this.selectors.length; i++) {
    var element = this.selectors[i].element;
    var optionName = element.getAttribute("data-option");
    var value = variant[optionName];
    if (value == null || !this.optionExistInSelect(element, value)) {
      continue;
    }

    element.value = value;
  }

  if (typeof jQuery !== "undefined") {
    jQuery(this.selectors[0].element).trigger("change", options);
  } else {
    this.selectors[0].element.onchange(options);
  }

  return true;
};

shop.OptionSelectors.prototype.optionExistInSelect = function(select, value) {
  for (var i = 0; i < select.options.length; i++) {
    if (select.options[i].value == value) {
      return true;
    }
  }
};

// insertSelectors(domId, msgDomId)
// create multi-selectors in the given domId, and use msgDomId to show messages
shop.OptionSelectors.prototype.insertSelectors = function(domId,messageElementId) {
  if (shop.isDefined(messageElementId)) {
    this.setMessageElement(messageElementId);
  }

  this.domIdPrefix = "product-" + this.product.id + "-variant-selector";

  var parent = document.getElementById(domId);
  shop.each(this.buildSelectors(), function(el) {
    parent.appendChild(el);
  });
};

// buildSelectors(index)
// create and return new selector element for given option
shop.OptionSelectors.prototype.buildSelectors = function() {
  // build selectors
  var name, values;
  for (var i = 0; i < this.product.optionNames().length; i++) {
    var name = this.product.optionNames()[i];
    var values = this.product.optionValues(name) || [];
    var sel = new shop.SingleOptionSelector(this, i, name, values);
    sel.element.disabled = false;
    this.selectors.push(sel);
  }

  // replace existing selector with new selectors, new hidden input field, new hidden messageElement
  var divClass = this.selectorDivClass;
  var optionNames = this.product.optionNames();
  var elements = shop.map(this.selectors, function(selector) {
    var div = document.createElement("div");
    div.setAttribute("class", divClass);
    // create label if more than 1 option (ie: more than one drop down)
    if (optionNames.length > 1 || this.alwaysDisplayLabel) {
      // create and appened a label into div
      var label = document.createElement("label");
      label.htmlFor = selector.element.id;
      label.innerHTML = selector.name;
      div.appendChild(label);
    }
    div.appendChild(selector.element);
    return div;
  });

  return elements;
};

// returns array of currently selected values from all multiselectors
shop.OptionSelectors.prototype.selectedValues = function() {
  var currValues = [];
  for (var i = 0; i < this.selectors.length; i++) {
    var thisValue = this.selectors[i].element.value;
    currValues.push(thisValue);
  }
  return currValues;
};

// callback when a selector is updated.
shop.OptionSelectors.prototype.updateSelectors = function(index, options) {
  var currValues = this.selectedValues(); // get current values
  var variant = this.product.getVariant(currValues);
  if (variant) {
    this.variantIdField.disabled = false;
    this.variantIdField.value = variant.id; // update hidden selector with new variant id
  } else {
    this.variantIdField.disabled = true;
  }

  this.onVariantSelected(variant, this, options); // callback

  if (this.historyState != null) {
    this.historyState.onVariantChange(variant, this, options);
  }
};

// ---------------------------------------------------------------------------
// OptionSelectorsFromDOM(domid, options)
//
// ---------------------------------------------------------------------------

shop.OptionSelectorsFromDOM = function(existingSelectorId, options) {
  // build product json from selectors
  // create new options hash
  var optionNames = options.optionNames || [];
  var priceFieldExists = options.priceFieldExists || true;
  var delimiter = options.delimiter || "/";
  var productObj = this.createProductFromSelector(
    existingSelectorId,
    optionNames,
    priceFieldExists,
    delimiter
  );
  options.product = productObj;
  shop.OptionSelectorsFromDOM.baseConstructor.call(
    this,
    existingSelectorId,
    options
  );
};

shop.extend(shop.OptionSelectorsFromDOM, shop.OptionSelectors);

// updates the product_json from existing select element
shop.OptionSelectorsFromDOM.prototype.createProductFromSelector = function(
  domId,
  optionNames,
  priceFieldExists,
  delimiter
) {
  if (!shop.isDefined(priceFieldExists)) {
    var priceFieldExists = true;
  }
  if (!shop.isDefined(delimiter)) {
    var delimiter = "/";
  }
  

  var oldSelector = document.getElementById(domId);
  var options = oldSelector.childNodes;
  console.log("options", options);
  var parent = oldSelector.parentNode;

  var optionCount = optionNames.length;

  // build product json + messages array
  var variants = [];
  var self = this;
  shop.each(options, function(option, variantIndex) {
    if (option.nodeType == 1 && option.tagName.toLowerCase() == "option") {
      var chunks = option.innerHTML.split(
        new RegExp("\\s*\\" + delimiter + "\\s*")
      );

      if (optionNames.length == 0) {
        optionCount = chunks.length - (priceFieldExists ? 1 : 0);
      }

      var optionOptionValues = chunks.slice(0, optionCount);
      var message = priceFieldExists ? chunks[optionCount] : "";
      var variantId = option.getAttribute("value");

      var attributes = {
        available: option.disabled ? false : true,
        id: parseFloat(option.value),
        price: message,
        option1: optionOptionValues[0] || "-",
        option2: optionOptionValues[1],
        option3: optionOptionValues[2]
      };
      variants.push(attributes);
    }
  });
  var updateObj = { variants: variants };
  if (optionNames.length == 0) {
    updateObj.options = [];
    for (var i = 0; i < optionCount; i++) {
      updateObj.options[i] = "option " + (i + 1);
    }
  } else {
    updateObj.options = optionNames;
  }
  return updateObj;
};

// ---------------------------------------------------------------------------
// SingleOptionSelector
// takes option name and values and creates a option selector from them
// ---------------------------------------------------------------------------
shop.SingleOptionSelector = function(multiSelector, index, name, values) {
  this.multiSelector = multiSelector;
  this.values = values;
  this.index = index;
  this.name = name;
  this.element = document.createElement("select");
  for (var i = 0; i < values.length; i++) {
    var opt = document.createElement("option");
    opt.value = values[i];
    opt.innerHTML = values[i];
    this.element.appendChild(opt);
  }
  this.element.setAttribute("class", this.multiSelector.selectorClass);
  this.element.setAttribute("data-option", "option" + (index + 1));
  this.element.id = multiSelector.domIdPrefix + "-option-" + index;
  this.element.onchange = function(event, options) {
    options = options || {};

    multiSelector.updateSelectors(index, options);
  };

  return true;
};

// ---------------------------------------------------------------------------
// Image.switchImage
// helps to switch variant images on variant selection
// ---------------------------------------------------------------------------
shop.Image = {
  preload: function(images, size) {
    for (var i = 0; i < images.length; i++) {
      var image = images[i];

      this.loadImage(shop.resizeImage(image, size));
    }
  },

  loadImage: function(path) {
    new Image().src = path;
  },

  switchImage: function(image, element, size, callback) {
    if (!image || !element) {
      return;
    }

    var imageUrl = shop.resizeImage(image.src, size);

    if (callback) {
      callback(imageUrl, image, element, size);
    } else {
      element.src = imageUrl;
    }
  }
};

// ---------------------------------------------------------------------------
// shop.HistoryState
// Gets events from Push State
// ---------------------------------------------------------------------------

shop.OptionSelectors.HistoryState = function(optionSelector) {
  if (this.browserSupports()) {
    this.register(optionSelector);
  }
};

shop.OptionSelectors.HistoryState.prototype.register = function(
  optionSelector
) {
  window.addEventListener("popstate", function(event) {
    optionSelector.selectVariantFromParamsOrDropdown({ popStateCall: true });
  });
};

shop.OptionSelectors.HistoryState.prototype.onVariantChange = function(
  variant,
  selector,
  data
) {
  if (this.browserSupports()) {
    if (variant && !data.initialLoad && !data.popStateCall) {
      window.history.replaceState({}, document.title, "?variant=" + variant.id);
    }
  }
};

shop.OptionSelectors.HistoryState.prototype.browserSupports = function() {
  return window.history && window.history.replaceState;
};
// ---------------------------------------------------------------------------
// shop.ReviewRatingSelector
// Replaces a select element with for example a stars-scale
// ---------------------------------------------------------------------------
shop.ReviewRatingSelector = function(existingSelectorId, options) {
  this.els = [];
  this.selectorDivClass = "rating-wrapper";
  this.starActiveClass = shop.isDefined(options.active)
    ? options.active
    : "panda-icon-ui-star color";
  this.starSelectedClass = shop.isDefined(options.selected)
    ? options.selected
    : this.starActiveClass;
  this.starEmptyClass = shop.isDefined(options.empty)
    ? options.empty
    : "panda-icon-ui-star-empty color";

  this.onRatingChange = shop.isDefined(options.onRatingChange)
    ? options.onRatingChange
    : function() {};
  this.onRatingHover = shop.isDefined(options.onRatingHover)
    ? options.onRatingHover
    : function() {};

  this.replaceSelector(existingSelectorId);
};
shop.ReviewRatingSelector.prototype.hoverStar = function(e) {
  e = e || window.event;
  var targetDomEl = e.target ? e.target : e.srcElement;
  var rating = parseInt(targetDomEl.getAttribute("data-value"));
  this.setActiveStars(rating);
  targetDomEl.className = this.starSelectedClass;
};
shop.ReviewRatingSelector.prototype.setRating = function(e) {
  e = e || window.event;
  var targetDomEl = e.target ? e.target : e.srcElement;
  var rating = parseInt(targetDomEl.getAttribute("data-value"));
  this.currentRating = rating;
  this.ratingField.value = rating;
  this.setActiveStars(rating);
  targetDomEl.className = this.starSelectedClass;
};
shop.ReviewRatingSelector.prototype.leaveRating = function(e) {
  this.setActiveStars(this.currentRating);
};
shop.ReviewRatingSelector.prototype.setActiveStars = function(rating) {
  for (var i = 0; i < this.els.length; i++) {
    if (this.els[i].getAttribute("data-value") <= rating) {
      this.els[i].className = this.starActiveClass;
    } else {
      this.els[i].className = this.starEmptyClass;
    }
  }
};
shop.ReviewRatingSelector.prototype.replaceSelector = function(domId) {
  var oldSelector = document.getElementById(domId);
  var parent = oldSelector.parentNode;
  var divEl = document.createElement("div");
  divEl.className = this.selectorDivClass;
  parent.appendChild(divEl);
  shop.addListener(divEl, "mouseout", shop.bind(this.leaveRating, this));
  oldSelector.style.display = "none";
  this.ratingField = oldSelector;

  this.currentRating = parseInt(this.ratingField.value);
  if (isNaN(this.currentRating)) {
    this.currentRating = 0;
  }

  for (var i = 0; i < 5; i++) {
    var el = document.createElement("span");
    el.className = this.starEmptyClass;
    el.setAttribute("data-value", i + 1);
    el.style.cursor = "pointer";
    shop.addListener(el, "mouseover", shop.bind(this.hoverStar, this));
    shop.addListener(el, "click", shop.bind(this.setRating, this));
    this.els.push(el);
    divEl.appendChild(el);
  }

  this.setActiveStars(this.currentRating);
};
