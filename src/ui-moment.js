/* globals angular:true, moment:true, console:true */
/*jshint multistr: true */
'use strict';

angular.module('ui.moment', ['ng'])
  .constant('uiMomentConfig', {})
  .directive('uiMoment', ['$locale', '$filter', '$window', 'uiMomentConfig', function ($locale, $filter, $window, uiMomentConfig) {
  var options = {};

  angular.extend(options, uiMomentConfig);

  return {
    require:'?ngModel',
    link: function postLink(scope, element, attrs, controller) {
      console.log('its here.  now: ' + moment()._d);
      console.log(arguments);

      // directive variables
      var currOffset = 0,
          currMoment = moment(),  // the currently selected moment
          targetMoment = moment().add('months', currOffset); // the current month
      var pickerElem, pickerHeaderSpans, pickerBody;

      // directive functions

      /**
      * Initialize the directive
      *
      * @method init
      * @private
      */
      var init = function () {
        var monthSelectors;
        var localizedWeekDays = '',
            rowHtml = '';

        for (var i = 0; i < $locale.DATETIME_FORMATS.SHORTDAY.length; i++) {
          localizedWeekDays += '<th class="js-ui-moment">'+$locale.DATETIME_FORMATS.SHORTDAY[i]+'</th>';
        }
        // need be able to display 6 weeks at max
        for (var j = 0; j < 6; j++) {
          rowHtml += '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
        }
        pickerElem = angular.element(document.createElement('div'));
        pickerElem.addClass('ui-moment js-ui-moment');
        pickerElem.html('\
          <div class="js-ui-moment header">\
            <a class="js-ui-moment pre-month" href=""></a>\
            <span class="js-ui-moment month"></span>\
            <span class="js-ui-moment year"></span>\
            <a class="js-ui-moment next-month" href=""></a>\
          </div>\
          <table class="js-ui-moment month-table">\
            <thead>\
              <tr>'+localizedWeekDays+'</tr>\
            </thead>\
            <tbody>'+rowHtml+'</tbody>\
          </table>');

        // add click handlers to the month toggle buttons
        monthSelectors = pickerElem.find('a');
        angular.element(monthSelectors[0]).on('click', function (event) {
          updatePickerContent(--currOffset);
          event.preventDefault();
        });
        angular.element(monthSelectors[1]).on('click', function (event) {
          updatePickerContent(++currOffset);
          event.preventDefault();
        });

        pickerHeaderSpans = pickerElem.find('span');
        pickerBody = pickerElem.find('tbody');
      };

      /**
      * Parse a date manually typed in by the user.
      *
      * @method parseDate
      * @param {Object} evt An event object
      */
      var parseDate = function (evt) {
        console.log('[parseDate()]');

        // try to parse the moment
        var enteredDate = angular.element(evt.currentTarget).val();

        // update the model if one was provided
        if (controller) {
          controller.$setViewValue($filter('date')(enteredDate, $locale.DATETIME_FORMATS.shortDate));
          controller.$render();
          scope.$apply();
        }

        console.log(enteredDate);
        removePicker();
      };

      /**
      * Process a date selected by the user in the picker.
      *
      * @method pickDate
      * @param {Object} evt An event object
      */
      var pickDate = function (evt) {
        console.log('[pickDate()]');
        console.log(evt);
        // parse the selected date
        currMoment = moment(targetMoment).date(evt.target.textContent);
        // update the model if one was provided
        if (controller) {
          controller.$setViewValue($filter('date')(currMoment.toDate(), $locale.DATETIME_FORMATS.shortDate));
          controller.$render();
          scope.$apply();
        }
        removePicker();
      };

      /**
      * Update the picker according to the offset
      *
      * @method updatePickerContent
      * @private
      * @param {Number} [offset] An optional integer offset from the current month (0 by default).
      */
      var updatePickerContent = function(offset) {
        // limit to 12 months back or 12 months forward
        offset = parseInt(offset, 10);
        if (isNaN(offset)) {
          offset = 0;
        }

        targetMoment = moment().add('months', offset);
        
        // build out the month table
        // set the header text
        angular.element(pickerHeaderSpans[0]).html($locale.DATETIME_FORMATS.MONTH[targetMoment.month()]);
        angular.element(pickerHeaderSpans[1]).html($filter('date')(targetMoment.toDate(), 'yyyy'));

        var dayElems = pickerBody.find('td');
        // clear cell contents, classes and click handlers
        dayElems.html('');
        dayElems.removeClass('day');
        dayElems.addClass('js-ui-moment');
        dayElems.off('click');

        //var today = moment().date();
        var tdIdx = moment(targetMoment).day() - 1;  // 0 based index
        // also need to account if first day of month is last day in week
        if (tdIdx < 0) {
          tdIdx = 6;
        }

        var len = moment(targetMoment).endOf('month').date() + 1;
        var i = 1;  // default to first day of month
        
        for (i; i < len; i++) {
          var currElem = angular.element(dayElems[tdIdx]);
          currElem.html(i);
          currElem.addClass('day');
          currElem.on('click', function(event) {
          	pickDate(event);
          	event.preventDefault();
          });
          //console.log(currElem);

          tdIdx++;
        }
      };

      /**
      * Renders a given month within the moment picker. Accepts an optional offset.
      *
      * @method renderPicker
      * @private
      * @param {Number} [offset] An optional integer offset from the current month (0 by default).
      */
      var renderPicker = function (offset) {
        removePicker();
        console.log('[renderPicker()]');
        
        updatePickerContent(offset);
        element.after(pickerElem);
        
        // hide picker when clicking outside  
        $window.onclick = function(event) {
          removePickerOnBadTarget(event);
        };
      };

      var removePicker = function () {
        console.log('[removePicker()]');
        // clean up event listeners

        var days = document.querySelectorAll('td.day.js-ui-moment');
        for (var i = 0; i < days.length; i++) {
        	angular.element(days[i]).off('click');
        }        
        //pickerElem.find('td').off('click');
        var pickers = document.querySelectorAll('div.ui-moment');
        for (var i = 0; i < pickers.length; i++) {
          pickers[i].remove();
        }
        // reset onclick event listener
        $window.onclick = null;
      };

      /**
       * Remove the picker when click outside.
       * 
       * @method renderPicker
       * @private
       * @param {Object} event An event object
       */
      var removePickerOnBadTarget = function(event) {
        var targetElement = event.target;
        if (!targetElement || angular.element(targetElement).attr('ui-moment')==='') {
          return;
        }

        console.log(targetElement.classList);

        if (!targetElement.classList.contains('js-ui-moment')) {
            removePicker();
            return;
        }
      };


      // scope functions


      // Event Handlers
      
      // on input blur
      //element.on('blur', removePicker);

      // on input focus
      element.on('focus', function() {
        renderPicker();
      });

      // on enter key press
      element.on('keyup', function (evt) {
        if (evt.keyCode === 13) {
          parseDate(evt);
        }
      });

      scope.$on('$destroy', function () {
        console.log('Adios amigos...');
        // clean up event listeners
        element.off('blur');
        element.off('focus');
        element.off('keyup');
        // reset onclick event listener
        $window.onclick = null;
      });

      // init
      init();
    }
  };
}]);
