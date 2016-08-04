/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/xy-for-jsPlugin/1.0.0/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	/**
	 * Created by weijianli on 16/5/26.
	 */
	__webpack_require__(7);

/***/ },

/***/ 1:
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];
	
		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};
	
		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },

/***/ 2:
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];
	
	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}
	
		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();
	
		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";
	
		var styles = listToStyles(list);
		addStylesToDom(styles, options);
	
		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}
	
	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}
	
	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}
	
	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}
	
	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}
	
	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}
	
	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}
	
	function addStyle(obj, options) {
		var styleElement, update, remove;
	
		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}
	
		update(obj);
	
		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}
	
	var replaceText = (function () {
		var textStore = [];
	
		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();
	
	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;
	
		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}
	
	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
	
		if(media) {
			styleElement.setAttribute("media", media)
		}
	
		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}
	
	function updateLink(linkElement, obj) {
		var css = obj.css;
		var sourceMap = obj.sourceMap;
	
		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}
	
		var blob = new Blob([css], { type: "text/css" });
	
		var oldSrc = linkElement.href;
	
		linkElement.href = URL.createObjectURL(blob);
	
		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ },

/***/ 7:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	/**
	 * Created by weijianli on 16/5/27.
	 */
	__webpack_require__(22);
	// require('./bootstrap-tagsinput-typeahead.css');
	// require('./typeahead.bundle.js');
	__webpack_require__(8);

/***/ },

/***/ 8:
/***/ function(module, exports) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };
	
	/*
	 * bootstrap-tagsinput v0.8.0
	 * 
	 */
	
	(function ($) {
	  "use strict";
	
	  var defaultOptions = {
	    tagClass: function tagClass(item) {
	      return 'label label-info';
	    },
	    focusClass: 'focus',
	    itemValue: function itemValue(item) {
	      return item ? item.toString() : item;
	    },
	    itemText: function itemText(item) {
	      return this.itemValue(item);
	    },
	    itemTitle: function itemTitle(item) {
	      return null;
	    },
	    freeInput: true,
	    addOnBlur: true,
	    maxTags: undefined,
	    maxChars: undefined,
	    confirmKeys: [13, 44],
	    delimiter: ',',
	    delimiterRegex: null,
	    cancelConfirmKeysOnEmpty: false,
	    onTagExists: function onTagExists(item, $tag) {
	      $tag.hide().fadeIn();
	    },
	    trimValue: false,
	    allowDuplicates: false,
	    triggerChange: true,
	
	    //////////////////
	    singleSelection: false,
	    selectLastColumn: true
	  };
	
	  /**
	   * Constructor function
	   */
	  function CascadeSelect(element, options) {
	    this.isInit = true;
	    this.itemsArray = [];
	
	    ////////////////
	    this.selectBoardRenderTimer = null;
	    // this.options = options;
	    this.selectRenderData = [];
	    this.selectedVal = null;
	    this.matchIndex = 1;
	    this.openFlag = false;
	    ///////////
	
	    this.$element = $(element);
	    this.$element.hide();
	
	    this.isSelect = element.tagName === 'SELECT';
	    this.multiple = this.isSelect && element.hasAttribute('multiple');
	    this.objectItems = options && options.itemValue;
	    this.placeholderText = element.hasAttribute('placeholder') ? this.$element.attr('placeholder') : '';
	    this.inputSize = Math.max(1, this.placeholderText.length);
	
	    this.$container = $('<div class="bootstrap-tagsinput"></div>');
	    this.$input = $('<input type="text" placeholder="' + this.placeholderText + '"/>').appendTo(this.$container);
	    this.$selectBoard = $('<div class="select-board"></div>').appendTo($('<div class="select-box"></div>').appendTo(this.$container));
	
	    this.$element.before(this.$container);
	    this.build(options);
	    this.isInit = false;
	  }
	
	  CascadeSelect.prototype = {
	    constructor: CascadeSelect,
	
	    /**
	     * Adds the given item as a new tag. Pass true to dontPushVal to prevent
	     * updating the elements val()
	     */
	    add: function add(item, dontPushVal, options) {
	      var self = this;
	
	      if (self.options.maxTags && self.itemsArray.length >= self.options.maxTags) return;
	
	      // Ignore falsey values, except false
	      if (item !== false && !item) return;
	
	      // Trim value
	      if (typeof item === "string" && self.options.trimValue) {
	        item = $.trim(item);
	      }
	
	      // Throw an error when trying to add an object while the itemValue option was not set
	      if ((typeof item === 'undefined' ? 'undefined' : _typeof(item)) === "object" && !self.objectItems) throw "Can't add objects when itemValue option is not set";
	
	      // Ignore strings only containg whitespace
	      if (item.toString().match(/^\s*$/)) return;
	
	      // If SELECT but not multiple, remove current tag
	      if (self.isSelect && !self.multiple && self.itemsArray.length > 0) self.remove(self.itemsArray[0]);
	
	      if (typeof item === "string" && this.$element[0].tagName === 'INPUT') {
	        var delimiter = self.options.delimiterRegex ? self.options.delimiterRegex : self.options.delimiter;
	        var items = item.split(delimiter);
	        if (items.length > 1) {
	          for (var i = 0; i < items.length; i++) {
	            this.add(items[i], true);
	          }
	
	          if (!dontPushVal) self.pushVal(self.options.triggerChange);
	          return;
	        }
	      }
	
	      var itemValue = self.options.itemValue(item),
	          itemText = self.options.itemText(item),
	          tagClass = self.options.tagClass(item),
	          itemTitle = self.options.itemTitle(item);
	
	      // Ignore items allready added
	      var existing = $.grep(self.itemsArray, function (item) {
	        return self.options.itemValue(item) === itemValue;
	      })[0];
	      if (existing && !self.options.allowDuplicates) {
	        // Invoke onTagExists
	        if (self.options.onTagExists) {
	          var $existingTag = $(".tag", self.$container).filter(function () {
	            return $(this).data("item") === existing;
	          });
	          self.options.onTagExists(item, $existingTag);
	        }
	        return;
	      }
	
	      // if length greater than limit
	      if (self.items().toString().length + item.length + 1 > self.options.maxInputLength) return;
	
	      // raise beforeItemAdd arg
	      var beforeItemAddEvent = $.Event('beforeItemAdd', { item: item, cancel: false, options: options });
	      self.$element.trigger(beforeItemAddEvent);
	      if (beforeItemAddEvent.cancel) return;
	
	      // register item in internal array and map
	      self.itemsArray.push(item);
	
	      // add a tag element
	
	      var $tag = $('<span class="tag ' + htmlEncode(tagClass) + (itemTitle !== null ? '" title="' + itemTitle : '') + '">' + htmlEncode(itemText) + '<span data-role="remove"></span></span>');
	      $tag.data('item', item);
	      self.findInputWrapper().before($tag);
	      $tag.after(' ');
	
	      // Check to see if the tag exists in its raw or uri-encoded form
	      var optionExists = $('option[value="' + encodeURIComponent(itemValue) + '"]', self.$element).length || $('option[value="' + htmlEncode(itemValue) + '"]', self.$element).length;
	
	      // add <option /> if item represents a value not present in one of the <select />'s options
	      if (self.isSelect && !optionExists) {
	        var $option = $('<option selected>' + htmlEncode(itemText) + '</option>');
	        $option.data('item', item);
	        $option.attr('value', itemValue);
	        self.$element.append($option);
	      }
	
	      if (!dontPushVal) self.pushVal(self.options.triggerChange);
	
	      // Add class when reached maxTags
	      if (self.options.maxTags === self.itemsArray.length || self.items().toString().length === self.options.maxInputLength) self.$container.addClass('bootstrap-tagsinput-max');
	
	      // If using typeahead, once the tag has been added, clear the typeahead value so it does not stick around in the input.
	      if ($('.typeahead, .twitter-typeahead', self.$container).length) {
	        self.$input.typeahead('val', '');
	      }
	
	      if (this.isInit) {
	        self.$element.trigger($.Event('itemAddedOnInit', { item: item, options: options }));
	      } else {
	        self.$element.trigger($.Event('itemAdded', { item: item, options: options }));
	      }
	    },
	
	    /**
	     * Removes the given item. Pass true to dontPushVal to prevent updating the
	     * elements val()
	     */
	    remove: function remove(item, dontPushVal, options) {
	      var self = this;
	
	      if (self.objectItems) {
	        if ((typeof item === 'undefined' ? 'undefined' : _typeof(item)) === "object") item = $.grep(self.itemsArray, function (other) {
	          return self.options.itemValue(other) == self.options.itemValue(item);
	        });else item = $.grep(self.itemsArray, function (other) {
	          return self.options.itemValue(other) == item;
	        });
	
	        item = item[item.length - 1];
	      }
	
	      if (item) {
	        var beforeItemRemoveEvent = $.Event('beforeItemRemove', { item: item, cancel: false, options: options });
	        self.$element.trigger(beforeItemRemoveEvent);
	        if (beforeItemRemoveEvent.cancel) return;
	
	        $('.tag', self.$container).filter(function () {
	          return $(this).data('item') === item;
	        }).remove();
	        $('option', self.$element).filter(function () {
	          return $(this).data('item') === item;
	        }).remove();
	        if ($.inArray(item, self.itemsArray) !== -1) self.itemsArray.splice($.inArray(item, self.itemsArray), 1);
	      }
	
	      if (!dontPushVal) self.pushVal(self.options.triggerChange);
	
	      // Remove class when reached maxTags
	      if (self.options.maxTags > self.itemsArray.length) self.$container.removeClass('bootstrap-tagsinput-max');
	
	      self.$element.trigger($.Event('itemRemoved', { item: item, options: options }));
	    },
	
	    /**
	     * Removes all items
	     */
	    removeAll: function removeAll() {
	      var self = this;
	
	      $('.tag', self.$container).remove();
	      $('option', self.$element).remove();
	
	      while (self.itemsArray.length > 0) {
	        self.itemsArray.pop();
	      }self.pushVal(self.options.triggerChange);
	    },
	
	    /**
	     * Refreshes the tags so they match the text/value of their corresponding
	     * item.
	     */
	    refresh: function refresh() {
	      var self = this;
	      $('.tag', self.$container).each(function () {
	        var $tag = $(this),
	            item = $tag.data('item'),
	            itemValue = self.options.itemValue(item),
	            itemText = self.options.itemText(item),
	            tagClass = self.options.tagClass(item);
	
	        // Update tag's class and inner text
	        $tag.attr('class', null);
	        $tag.addClass('tag ' + htmlEncode(tagClass));
	        $tag.contents().filter(function () {
	          return this.nodeType == 3;
	        })[0].nodeValue = htmlEncode(itemText);
	
	        if (self.isSelect) {
	          var option = $('option', self.$element).filter(function () {
	            return $(this).data('item') === item;
	          });
	          option.attr('value', itemValue);
	        }
	      });
	    },
	
	    /**
	     * Returns the items added as tags
	     */
	    items: function items() {
	      return this.itemsArray;
	    },
	
	    /**
	     * Assembly value by retrieving the value of each item, and set it on the
	     * element.
	     */
	    pushVal: function pushVal() {
	      var self = this,
	          val = $.map(self.items(), function (item) {
	        return self.options.itemValue(item).toString();
	      });
	
	      self.$element.val(val, true);
	
	      if (self.options.triggerChange) self.$element.trigger('change');
	    },
	
	    /**
	     * Initializes the tags input behaviour on the element
	     */
	    build: function build(options) {
	      var self = this;
	
	      self.options = $.extend({}, defaultOptions, options);
	      // When itemValue is set, freeInput should always be false
	      if (self.objectItems) self.options.freeInput = false;
	      self.options["itemValue_"] = self.options.itemValue;
	      self.options["itemText_"] = self.options.itemText;
	      makeOptionItemFunction(self.options, 'itemValue');
	      makeOptionItemFunction(self.options, 'itemText');
	      makeOptionFunction(self.options, 'tagClass');
	
	      // Typeahead Bootstrap version 2.3.2
	      // if (self.options.typeahead) {
	      //   var typeahead = self.options.typeahead || {};
	      //
	      //   makeOptionFunction(typeahead, 'source');
	      //
	      //   self.$input.typeahead({},$.extend({}, typeahead, {
	      //     source: function (query, process) {
	      //       function processItems(items) {
	      //         var texts = [];
	      //
	      //         for (var i = 0; i < items.length; i++) {
	      //           var text = self.options.itemText(items[i]);
	      //           map[text] = items[i];
	      //           texts.push(text);
	      //         }
	      //         process(texts);
	      //       }
	      //
	      //       this.map = {};
	      //       var map = this.map,
	      //           data = typeahead.source(query);
	      //
	      //       if ($.isFunction(data.success)) {
	      //         // support for Angular callbacks
	      //         data.success(processItems);
	      //       } else if ($.isFunction(data.then)) {
	      //         // support for Angular promises
	      //         data.then(processItems);
	      //       } else {
	      //         // support for functions and jquery promises
	      //         $.when(data)
	      //          .then(processItems);
	      //       }
	      //     },
	      //     updater: function (text) {
	      //       self.add(this.map[text]);
	      //       return this.map[text];
	      //     },
	      //     matcher: function (text) {
	      //       return (text.toLowerCase().indexOf(this.query.trim().toLowerCase()) !== -1);
	      //     },
	      //     sorter: function (texts) {
	      //       return texts.sort();
	      //     },
	      //     highlighter: function (text) {
	      //       var regex = new RegExp( '(' + this.query + ')', 'gi' );
	      //       return text.replace( regex, "<strong>$1</strong>" );
	      //     }
	      //   }));
	      // }
	      //
	      // // typeahead.js
	      // if (self.options.typeaheadjs) {
	      //     var typeaheadConfig = null;
	      //     var typeaheadDatasets = {};
	      //
	      //     // Determine if main configurations were passed or simply a dataset
	      //     var typeaheadjs = self.options.typeaheadjs;
	      //     if ($.isArray(typeaheadjs)) {
	      //       typeaheadConfig = typeaheadjs[0];
	      //       typeaheadDatasets = typeaheadjs[1];
	      //     } else {
	      //       typeaheadDatasets = typeaheadjs;
	      //     }
	      //
	      //     self.$input.typeahead(typeaheadConfig, typeaheadDatasets).on('typeahead:selected', $.proxy(function (obj, datum) {
	      //       if (typeaheadDatasets.valueKey)
	      //         self.add(datum[typeaheadDatasets.valueKey]);
	      //       else
	      //         self.add(datum);
	      //       self.$input.typeahead('val', '');
	      //     }, self));
	      // }
	
	      self.$container.on('click', $.proxy(function (event) {
	        if (!self.$element.attr('disabled')) {
	          self.$input.removeAttr('disabled');
	        }
	        self.$input.focus();
	      }, self));
	
	      if (self.options.addOnBlur && self.options.freeInput) {
	        self.$input.on('focusout', $.proxy(function (event) {
	          // HACK: only process on focusout when no typeahead opened, to
	          //       avoid adding the typeahead text as tag
	          if ($('.typeahead, .twitter-typeahead', self.$container).length === 0) {
	            self.add(self.$input.val());
	            self.$input.val('');
	          }
	        }, self));
	      }
	
	      // Toggle the 'focus' css class on the container when it has focus
	      self.$container.on({
	        focusin: function focusin() {
	          if (!self.openFlag) {
	            self.openFlag = true;
	            selectBoardRender(self, 'open');
	          }
	          self.$container.addClass(self.options.focusClass);
	        },
	        focusout: function focusout() {
	          if (self.openFlag) {
	            self.openFlag = false;
	            selectBoardRender(self, 'close');
	          }
	          self.$container.removeClass(self.options.focusClass);
	        }
	      });
	      self.$container.on('input', 'input', function (event) {
	        self.matchIndex = 1;
	        var query = event.target.value;
	        self.boardRender(query);
	      });
	      self.$container.on('keydown', 'input', $.proxy(function (event) {
	        var $input = $(event.target),
	            $inputWrapper = self.findInputWrapper();
	
	        if (self.$element.attr('disabled')) {
	          self.$input.attr('disabled', 'disabled');
	          return;
	        }
	        switch (event.which) {
	
	          // BACKSPACE
	          case 8:
	            if (doGetCaretPosition($input[0]) === 0) {
	              var prev = $inputWrapper.prev();
	              if (prev.length) {
	                self.remove(prev.data('item'));
	              }
	            }
	            break;
	
	          // DELETE
	          case 46:
	            if (doGetCaretPosition($input[0]) === 0) {
	              var next = $inputWrapper.next();
	              if (next.length) {
	                self.remove(next.data('item'));
	              }
	            }
	            break;
	
	          // LEFT ARROW
	          case 37:
	            // Try to move the input before the previous tag
	            var $prevTag = $inputWrapper.prev();
	            if ($input.val().length === 0 && $prevTag[0]) {
	              $prevTag.before($inputWrapper);
	              $input.focus();
	            }
	            break;
	          // RIGHT ARROW
	          case 39:
	            // Try to move the input after the next tag
	            var $nextTag = $inputWrapper.next();
	            if ($input.val().length === 0 && $nextTag[0]) {
	              $nextTag.after($inputWrapper);
	              $input.focus();
	            }
	            break;
	          //UP ARROW
	          case 38:
	            //console.log('上');
	            self.boardRender(event.target.value, 'up');
	            break;
	
	          case 40:
	            //console.log('下');
	            self.boardRender(event.target.value, 'down');
	
	            break;
	          case 13:
	            {
	              //ENTER
	
	              var $ele = $(".bootstrap-tagsinput .select-box .list-group-item.active");
	
	              itemSelectedFun(self, $ele);
	              break;
	            }
	
	          default:
	          // ignore
	        }
	
	        // Reset internal input's size
	        var textLength = $input.val().length,
	            wordSpace = Math.ceil(textLength / 5),
	            size = textLength + wordSpace + 1;
	        $input.attr('size', Math.max(this.inputSize, $input.val().length));
	      }, self));
	
	      self.$container.on('keypress', 'input', $.proxy(function (event) {
	        var $input = $(event.target);
	
	        if (self.$element.attr('disabled')) {
	          self.$input.attr('disabled', 'disabled');
	          return;
	        }
	
	        var text = $input.val(),
	            maxLengthReached = self.options.maxChars && text.length >= self.options.maxChars;
	        if (self.options.freeInput && (keyCombinationInList(event, self.options.confirmKeys) || maxLengthReached)) {
	          // Only attempt to add a tag if there is data in the field
	          if (text.length !== 0) {
	            self.add(maxLengthReached ? text.substr(0, self.options.maxChars) : text);
	            $input.val('');
	          }
	
	          // If the field is empty, let the event triggered fire as usual
	          if (self.options.cancelConfirmKeysOnEmpty === false) {
	            event.preventDefault();
	          }
	        }
	
	        // Reset internal input's size
	        var textLength = $input.val().length,
	            wordSpace = Math.ceil(textLength / 5),
	            size = textLength + wordSpace + 1;
	        $input.attr('size', Math.max(this.inputSize, $input.val().length));
	      }, self));
	
	      // Remove icon clicked
	      self.$container.on('click', '[data-role=remove]', $.proxy(function (event) {
	        if (self.$element.attr('disabled')) {
	          return;
	        }
	        self.remove($(event.target).closest('.tag').data('item'));
	      }, self));
	
	      // Only add existing value as tags when using strings as tags
	      if (self.options.itemValue === defaultOptions.itemValue) {
	        if (self.$element[0].tagName === 'INPUT') {
	          self.add(self.$element.val());
	        } else {
	          $('option', self.$element).each(function () {
	            self.add($(this).attr('value'), true);
	          });
	        }
	      }
	
	      self.$selectBoard.on('click', '.select-item', function (event) {
	        var $ele = $(event.target);
	
	        itemSelectedFun(self, $ele);
	      });
	    },
	
	    /**
	     * Removes all tagsinput behaviour and unregsiter all event handlers
	     */
	    destroy: function destroy() {
	      var self = this;
	
	      // Unbind events
	      self.$container.off('keypress', 'input');
	      self.$container.off('click', '[role=remove]');
	
	      self.$container.remove();
	      self.$element.removeData('tagsinput');
	      self.$element.show();
	    },
	
	    /**
	     * Sets focus on the tagsinput
	     */
	    focus: function focus() {
	      this.$input.focus();
	    },
	
	    /**
	     * Returns the internal input element
	     */
	    input: function input() {
	      return this.$input;
	    },
	
	    /**
	     * Returns the element which is wrapped around the internal input. This
	     * is normally the $container, but typeahead.js moves the $input element.
	     */
	    findInputWrapper: function findInputWrapper() {
	      var elt = this.$input[0],
	          container = this.$container[0];
	      while (elt && elt.parentNode !== container) {
	        elt = elt.parentNode;
	      }return $(elt);
	    },
	
	    /**
	     * 根据selectRenderData渲染selectBoard
	     * */
	    boardRender: function boardRender(query, updwon) {
	      var self = this;
	      var html = '';
	      var cnt = 0;
	      var regex = new RegExp('(' + query + ')', 'gi');
	
	      var matchTotal = matchCounter(self.selectRenderData, query);
	      var matchCnt = 0;
	      var normalCnt = 0;
	      if (matchTotal > 0) {
	        if (updwon == 'up') {
	          self.matchIndex = self.matchIndex <= 1 ? matchTotal : self.matchIndex - 1;
	        } else if (updwon == 'down') {
	          self.matchIndex = self.matchIndex == matchTotal ? 1 : self.matchIndex + 1;
	        }
	      }
	
	      self.selectRenderData.forEach(function (column) {
	        cnt++;
	        html += '<div class="list-group"><div>';
	        column.forEach(function (item) {
	          if (self.options.selectLastColumn) {
	            if (!item.children) {
	              normalCnt++;
	            }
	          } else {
	            normalCnt++;
	          }
	          var dataValue = item.children ? 'data-val="' + es(item[self.options.itemValue_]) + '"' : '';
	          var text, styleClass, cntMark;
	          if (query) {
	            if (regex.test(item.text)) {
	              if (self.options.selectLastColumn) {
	                if (!item.children) {
	                  matchCnt++;
	                }
	              } else {
	                matchCnt++;
	              }
	              if (matchCnt == self.matchIndex) {
	                text = es(item.text).replace(regex, "<strong>$1</strong>");
	                styleClass = 'active';
	              } else {
	                text = es(item.text).replace(regex, "<strong class='text-primary'>$1</strong>");
	                styleClass = 'b';
	              }
	            } else {
	              text = es(item.text);
	              styleClass = 'a';
	            }
	          } else {
	
	            if (self.options.selectLastColumn) {
	              if (!item.children) {
	                matchCnt++;
	              }
	            } else {
	              matchCnt++;
	            }
	
	            if (matchCnt == self.matchIndex) {
	              styleClass = 'active';
	            }
	            text = es(item.text);
	          }
	          cntMark = 'data-mh-cnt="' + normalCnt + '"';
	          html += '<a href="javascript:void(0);" class="list-group-item ' + styleClass + ' select-item" data-cnt=' + cnt + ' ' + cntMark + ' data-string=\'' + JSON.stringify(item) + '\' ' + dataValue + ' title="' + es(item.text) + '">' + text + '</a>';
	        });
	        html += '</div></div>';
	      });
	      self.$selectBoard.html(html);
	      var selectedOne = $(".bootstrap-tagsinput .select-box .list-group-item.active");
	      if (selectedOne && selectedOne.length > 0) {
	        var p = selectedOne.parent();
	        var h = p.innerHeight();
	        var rh = selectedOne.position().top;
	        if (rh + 44 > h) {
	          p.scrollTop(rh + 44 - h);
	        }
	      }
	
	      function matchCounter(data, query) {
	        var c = 0;
	        //var regex = new RegExp( '(' + query + ')', 'gi' );
	        data.forEach(function (column) {
	          column.forEach(function (item) {
	            if (query) {
	              if (item.text.indexOf(query) != -1) {
	                if (self.options.selectLastColumn) {
	                  if (!item.children) {
	                    c++;
	                  }
	                } else {
	                  c++;
	                }
	              }
	            } else {
	              if (self.options.selectLastColumn) {
	                if (!item.children) {
	                  c++;
	                }
	              } else {
	                c++;
	              }
	            }
	          });
	        });
	        return c;
	      }
	    },
	    getSelectRenderData: function getSelectRenderData(value) {
	      var self = this;
	      if (!self.options.selectDataUrl) {
	        throw "need selectDataUrl in options!!";
	      }
	      $.get(self.options.selectDataUrl + '?parentValue=' + (value ? value : ''), function (redata) {
	        if (typeof redata == 'string') {
	          redata = JSON.parse(redata);
	        }
	        if (Object.prototype.toString.call(redata) != '[object Array]') {
	          throw 'SelectRenderData need be array format';
	        }
	        if (self.options.selectLastColumn) {
	          self.matchIndex = 1;
	        } else {
	          self.matchIndex = counter(self.selectRenderData) + 1;
	        }
	
	        self.selectRenderData.push(redata);
	        self.boardRender();
	        self.$selectBoard.scrollLeft(self.$selectBoard.get(0).scrollWidth - self.$selectBoard.innerWidth());
	      });
	
	      function counter(data) {
	        var re = 0;
	        data.forEach(function (column) {
	          re += column.length;
	        });
	        return re;
	      }
	    }
	
	  };
	
	  /**
	   * Register JQuery plugin
	   */
	  $.fn.cascadeSelect = function (arg1, arg2, arg3) {
	    var results = [];
	
	    this.each(function () {
	      var cascadeSelect = $(this).data('cascadeSelect');
	      // Initialize a new tags input
	      if (!cascadeSelect) {
	        cascadeSelect = new CascadeSelect(this, arg1);
	        $(this).data('cascadeSelect', cascadeSelect);
	        results.push(cascadeSelect);
	
	        if (this.tagName === 'SELECT') {
	          $('option', $(this)).attr('selected', 'selected');
	        }
	
	        // Init tags from $(this).val()
	        $(this).val($(this).val());
	      } else if (!arg1 && !arg2) {
	        // cascadeSelect already exists
	        // no function, trying to init
	        results.push(cascadeSelect);
	      } else if (cascadeSelect[arg1] !== undefined) {
	        // Invoke function on existing tags input
	        if (cascadeSelect[arg1].length === 3 && arg3 !== undefined) {
	          var retVal = cascadeSelect[arg1](arg2, null, arg3);
	        } else {
	          var retVal = cascadeSelect[arg1](arg2);
	        }
	        if (retVal !== undefined) results.push(retVal);
	      }
	    });
	
	    if (typeof arg1 == 'string') {
	      // Return the results from the invoked function calls
	      return results.length > 1 ? results : results[0];
	    } else {
	      return results;
	    }
	  };
	
	  $.fn.cascadeSelect.Constructor = CascadeSelect;
	
	  /**
	   * Most options support both a string or number as well as a function as
	   * option value. This function makes sure that the option with the given
	   * key in the given options is wrapped in a function
	   */
	  function makeOptionItemFunction(options, key) {
	    if (typeof options[key] !== 'function') {
	      var propertyName = options[key];
	      options[key] = function (item) {
	        return item[propertyName];
	      };
	    }
	  }
	  function makeOptionFunction(options, key) {
	    if (typeof options[key] !== 'function') {
	      var value = options[key];
	      options[key] = function () {
	        return value;
	      };
	    }
	  }
	  /**
	   * HtmlEncodes the given value
	   */
	  var htmlEncodeContainer = $('<div />');
	  function htmlEncode(value) {
	    if (value) {
	      return htmlEncodeContainer.text(value).html();
	    } else {
	      return '';
	    }
	  }
	
	  /**
	   * Returns the position of the caret in the given input field
	   * http://flightschool.acylt.com/devnotes/caret-position-woes/
	   */
	  function doGetCaretPosition(oField) {
	    var iCaretPos = 0;
	    if (document.selection) {
	      oField.focus();
	      var oSel = document.selection.createRange();
	      oSel.moveStart('character', -oField.value.length);
	      iCaretPos = oSel.text.length;
	    } else if (oField.selectionStart || oField.selectionStart == '0') {
	      iCaretPos = oField.selectionStart;
	    }
	    return iCaretPos;
	  }
	
	  /**
	    * Returns boolean indicates whether user has pressed an expected key combination.
	    * @param object keyPressEvent: JavaScript event object, refer
	    *     http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
	    * @param object lookupList: expected key combinations, as in:
	    *     [13, {which: 188, shiftKey: true}]
	    */
	  function keyCombinationInList(keyPressEvent, lookupList) {
	    var found = false;
	    $.each(lookupList, function (index, keyCombination) {
	      if (typeof keyCombination === 'number' && keyPressEvent.which === keyCombination) {
	        found = true;
	        return false;
	      }
	
	      if (keyPressEvent.which === keyCombination.which) {
	        var alt = !keyCombination.hasOwnProperty('altKey') || keyPressEvent.altKey === keyCombination.altKey,
	            shift = !keyCombination.hasOwnProperty('shiftKey') || keyPressEvent.shiftKey === keyCombination.shiftKey,
	            ctrl = !keyCombination.hasOwnProperty('ctrlKey') || keyPressEvent.ctrlKey === keyCombination.ctrlKey;
	        if (alt && shift && ctrl) {
	          found = true;
	          return false;
	        }
	      }
	    });
	
	    return found;
	  }
	
	  /**
	   * 选择板块渲染代码
	   * @param object self: 插件生成的自身对象
	   * @param string type: 'open':打开;'close':关闭
	   *     
	   */
	  function selectBoardRender(self, type) {
	    if (type == 'close') {
	      //关闭展现
	      self.selectBoardRenderTimer = setTimeout(function () {
	        self.$selectBoard.animate().animate({
	          height: "0"
	        }, 400, function () {
	          self.$selectBoard.css('display', 'none');
	        });
	      }, 500);
	    } else if (type == 'open') {
	      //展现
	      if (self.selectBoardRenderTimer) {
	        clearTimeout(self.selectBoardRenderTimer);
	        self.selectBoardRenderTimer = null;
	      }
	      self.$selectBoard.css('display', 'block');
	      self.$selectBoard.animate().animate({
	        height: "320px"
	      }, 400);
	
	      if (self.selectRenderData.length == 0) {
	        self.getSelectRenderData();
	      }
	    }
	  }
	
	  /**
	   * 有元素被选中的处理函数
	   * */
	  function itemSelectedFun(self, $ele) {
	    var selectedVal = $ele.attr('data-val');
	    if (!selectedVal) {
	      if (self.options.singleSelection) {
	        self.removeAll();
	      }
	      self.add(JSON.parse($ele.attr('data-string')));
	      $(".bootstrap-tagsinput .select-box .list-group-item").removeClass('active');
	      $ele.addClass('active');
	      self.matchIndex = parseInt($ele.attr('data-mh-cnt'));
	    } else {
	      if (selectedVal == self.selectedVal) {
	        if (!self.options.selectLastColumn) {
	          if (self.options.singleSelection) {
	            self.removeAll();
	          }
	          self.add(JSON.parse($ele.attr('data-string')));
	          $(".bootstrap-tagsinput .select-box .list-group-item").removeClass('active');
	          $ele.addClass('active');
	          self.matchIndex = parseInt($ele.attr('data-mh-cnt'));
	        }
	      } else {
	        var cnt = parseInt($ele.attr('data-cnt'));
	        self.selectRenderData = self.selectRenderData.slice(0, cnt);
	        self.getSelectRenderData(selectedVal);
	        self.selectedVal = selectedVal;
	      }
	    }
	    self.$input.val('');
	  }
	
	  /**
	   * 转意
	   * */
	  function es(content) {
	    if (typeof content !== 'string') {
	      var type = typeof content === 'undefined' ? 'undefined' : _typeof(content);
	      if (type === 'number') {
	        content += '';
	      } else {
	        content = '';
	      }
	    }
	    var escapeMap = {
	      "<": "&#60;",
	      ">": "&#62;",
	      '"': "&#34;",
	      "'": "&#39;",
	      "&": "&#38;"
	    };
	    return content.replace(/&(?![\w#]+;)|[<>"']/g, function (s) {
	      return escapeMap[s];
	    });
	  }
	
	  /**
	   * Initialize tagsinput behaviour on inputs and selects which have
	   * data-role=tagsinput
	   */
	  $(function () {
	    $("input[data-role=tagsinput], select[multiple][data-role=tagsinput]").cascadeSelect();
	  });
	})(window.jQuery);

/***/ },

/***/ 15:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(1)();
	// imports
	
	
	// module
	exports.push([module.id, "/*\n * bootstrap-tagsinput v0.8.0\n * \n */\n\n.bootstrap-tagsinput {\n  position: relative;\n  background-color: #fff;\n  border: 1px solid #ccc;\n  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n  display: inline-block;\n  padding: 4px 6px;\n  color: #555;\n  vertical-align: middle;\n  border-radius: 4px;\n  max-width: 100%;\n  line-height: 22px;\n  cursor: text;\n}\n.bootstrap-tagsinput input {\n  border: none;\n  box-shadow: none;\n  outline: none;\n  background-color: transparent;\n  padding: 0 6px;\n  margin: 0;\n  width: auto;\n  max-width: inherit;\n}\n.bootstrap-tagsinput.form-control input::-moz-placeholder {\n  color: #777;\n  opacity: 1;\n}\n.bootstrap-tagsinput.form-control input:-ms-input-placeholder {\n  color: #777;\n}\n.bootstrap-tagsinput.form-control input::-webkit-input-placeholder {\n  color: #777;\n}\n.bootstrap-tagsinput input:focus {\n  border: none;\n  box-shadow: none;\n}\n.bootstrap-tagsinput .tag {\n  margin-right: 2px;\n  color: white;\n}\n.bootstrap-tagsinput .tag [data-role=\"remove\"] {\n  margin-left: 8px;\n  cursor: pointer;\n}\n.bootstrap-tagsinput .tag [data-role=\"remove\"]:after {\n  content: \"x\";\n  padding: 0px 2px;\n}\n.bootstrap-tagsinput .tag [data-role=\"remove\"]:hover {\n  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 1px 2px rgba(0, 0, 0, 0.05);\n}\n.bootstrap-tagsinput .tag [data-role=\"remove\"]:hover:active {\n  box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);\n}\n\n/*////////////////////////*/\n\n.bootstrap-tagsinput .select-box{\n  position: absolute;\n  width: 100%;\n  min-width: 320px;\n  height: 0;\n  bottom: 0;\n  left: 0;\n  z-index: 20;\n}\n.bootstrap-tagsinput .select-box>div{\n  width: 100%;\n  background-color: #ffffff;\n  border: 1px solid #aaaaaa;\n  display: none;\n  border-bottom-left-radius: 5px;\n  border-bottom-right-radius: 5px;\n  overflow-x: auto!important;\n  box-shadow: 0 4px 4px #999;\n}\n\n.bootstrap-tagsinput .select-box .list-group{\n  width: 150px;\n  height: 100%;\n  margin: 0;\n  display: table-cell;\n}\n.bootstrap-tagsinput .select-box .list-group>div{\n  overflow-y: auto;\n  overflow-x: hidden;\n  height: 300px;\n  padding-right: 15px;\n}\n.bootstrap-tagsinput .select-box .list-group-item{\n  overflow:hidden;word-wrap:normal;white-space:nowrap;text-overflow:ellipsis;width: 150px;position: relative;\n}\n\n.bootstrap-tagsinput .select-box .list-group-item[data-val]:after{\n  content: '';\n  position: absolute;\n  width: 0;\n  height: 0;\n  border-left: 6px solid;\n  border-top: 5px solid transparent;\n  border-bottom: 5px solid transparent;\n  border-right: 0;\n  top: 50%;\n  margin-top: -3px;\n  right: 10px;\n}", ""]);
	
	// exports


/***/ },

/***/ 22:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(15);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(2)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/postcss-loader/index.js!./bootstrap-tagsinput.css", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/postcss-loader/index.js!./bootstrap-tagsinput.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ }

/******/ });
//# sourceMappingURL=bootstrap-cascade-select.js.map