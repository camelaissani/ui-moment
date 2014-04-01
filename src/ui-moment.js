/* globals angular:true, moment:true, console:true */
/* jshint multistr: true */

angular.module('ui.moment', ['ng', 'dateParser'])
  .constant('uiMomentConfig', {})
  .directive('uiMoment', ['$locale', '$filter', '$window', '$dateParser', 'uiMomentConfig', function ($locale, $filter, $window, $dateParser, uiMomentConfig) {
  
  'use strict';
  var options = {};

  angular.extend(options, uiMomentConfig);
  moment.lang($locale.id.split('-')[0]);
  return {
    require:'?ngModel',
    link: function postLink(scope, element, attrs, controller) {
      console.log('its here.  now: ' + moment()._d);
      console.log(arguments);

      // directive variables
      var pattern = element.attr('ui-moment'),
          currMoment = moment();  // the currently selected moment
      var pickerElem, pickerHeaderSpans, pickerBody, headerSelectors;

      if (pattern === '') {
        pattern = 'MM/dd/yyyy';
      }

      // directive functions

      /**
      * Initialize the directive
      *
      * @method init
      * @private
      */
      var init = function () {
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
        pickerElem.addClass('ui-moment-wrapper');
        pickerElem.html('\
          <div class="ui-moment">\
            <div class="header">\
              <div class=" month-selectors">\
                <span class="month"></span>\
              </div>\
              <div class="year-selectors">\
                <span class=" year"></span>\
                <a class="pre-year"></a>\
                <a class="next-year"></a>\
              </div>\
              <a class="pre-month"></a>\
              <a class="next-month"></a>\
            </div>\
            <div class=" month-table">\
              <table>\
                <thead>\
                  <tr>'+localizedWeekDays+'</tr>\
                </thead>\
                <tbody>'+rowHtml+'</tbody>\
              </table>\
            </div>\
          </div>');

        // save html element references
        headerSelectors = pickerElem.find('a');
        pickerHeaderSpans = pickerElem.find('span');
        pickerBody = pickerElem.find('tbody');

        // Add class js-ui-moment at all html elements to check when user click outside
        pickerElem.find('div').addClass('js-ui-moment');
        headerSelectors.addClass('js-ui-moment');
        pickerHeaderSpans.addClass('js-ui-moment');
        pickerElem.find('table').addClass('js-ui-moment');
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
        var enteredDate = $dateParser(angular.element(evt.currentTarget).val(), pattern);

        // update the model if one was provided
        if (controller) {
          controller.$setViewValue($filter('date')(enteredDate, pattern));
          controller.$render();
          scope.$apply();
        }
        
        removePicker();
        console.log(enteredDate);
      };

      /**
      * Process a date selected by the user in the picker.
      *
      * @method pickDate
      * @param {Object} evt An event object
      */
      var pickDate = function (evt) {
        console.log('[pickDate()]');
        var formattedDate = '';
        // parse the selected date
        currMoment = currMoment.date(evt.target.textContent).startOf('day');
        formattedDate = $filter('date')(currMoment.toDate(), pattern);

        console.log('['+formattedDate+']');
        // update the model if one was provided
        if (controller) {
          controller.$setViewValue(formattedDate);
          controller.$render();
          scope.$apply();
        }
        removePicker();
        evt.preventDefault();
      };

      /**
      * Update the picker according to the offset
      *
      * @method updatePickerContent
      * @private
      * @param {Number} [monthOffset] An optional integer offset from the current month (possible values 0,1,-1; 0 by default).
      * @param {Number} [yearOffset] An optional integer offset from the current year (possible values 0,1,-1; 0 by default).
      */
      var updatePickerContent = function(monthOffset, yearOffset) {
        // limit to 12 months back or 12 months forward
        monthOffset = parseInt(monthOffset, 10);
        if (isNaN(monthOffset)) {
          monthOffset = 0;
        }
        yearOffset = parseInt(yearOffset, 10);
        if (isNaN(yearOffset)) {
          yearOffset = 0;
        }

        if (monthOffset>0) {
          currMoment.add('month', 1);
        }
        else if (monthOffset<0) {
          currMoment.subtract('month', 1);
        }
        if (yearOffset>0) {
          currMoment.add('year', 1);
        }
        else if (yearOffset<0) {
          currMoment.subtract('year', 1);
        }
        
        // build out the month table
        // set the header text
        angular.element(pickerHeaderSpans[0]).html($locale.DATETIME_FORMATS.MONTH[currMoment.month()]);
        angular.element(pickerHeaderSpans[1]).html($filter('date')(currMoment.toDate(), 'yyyy'));

        var dayElems = pickerBody.find('td');
        // clear cell contents, classes and click handlers
        dayElems.html('&nbsp;');
        dayElems.removeClass('day');
        dayElems.removeClass('selected');
        dayElems.addClass('js-ui-moment');
        dayElems.off('click');

        //var today = moment().date();
        var selectedDay = currMoment.date(),
            tdIdx = currMoment.day(); // 0 based like the dayElems array
        // also need to account if first day of month is last day in week
        if (tdIdx < 0) {
          tdIdx = 6;
        }

        var len = moment(currMoment).endOf('month').date();
        
        // i = 1 default to first day of month
        for (var i = 1; i <= len; i++) {
          var currElem = angular.element(dayElems[tdIdx]);
          currElem.html(i);
          if (i === selectedDay) {
            currElem.addClass('selected');
          }
          currElem.addClass('day');
          currElem.on('click', pickDate);
          //console.log(currElem);
          tdIdx++;
        }

         // update the model if one was provided
        var formattedDate = $filter('date')(currMoment.toDate(), pattern);
        if (controller) {
          controller.$setViewValue(formattedDate);
          controller.$render();
          scope.$apply();
          console.log('[update scope]');
          console.log('['+formattedDate+']');
        }
      };

      /**
      * Renders a given month within the moment picker. Accepts an optional offset.
      *
      * @method renderPicker
      * @private
      */
      var renderPicker = function () {
        removePicker();
        console.log('[renderPicker()]');
        
        updatePickerContent();
        element.after(pickerElem);

        // add click handlers to the month toggle buttons
        // Year--
        angular.element(headerSelectors[0]).on('click', function (event) {
          updatePickerContent(0, 1);
          event.preventDefault();
        });
        // Year++
        angular.element(headerSelectors[1]).on('click', function (event) {
          updatePickerContent(0, -1);
          event.preventDefault();
        });
        // Month--
        angular.element(headerSelectors[2]).on('click', function (event) {
          updatePickerContent(-1);
          event.preventDefault();
        });
        // Month++
        angular.element(headerSelectors[3]).on('click', function (event) {
          updatePickerContent(1);
          event.preventDefault();
        });

        // hide picker when clicking outside  
        $window.onclick = function(event) {
          removePickerOnBadTarget(event);
        };
      };

      var removePicker = function () {
        console.log('[removePicker()]');
        // clean up event listeners

        var days = document.querySelectorAll('.ui-moment td.day');
        for (var i = 0; i < days.length; i++) {
          angular.element(days[i]).off('click');
        }

        // add click handlers to the month toggle buttons
        // Year--
        angular.element(headerSelectors[0]).off('click');
        // Year++
        angular.element(headerSelectors[1]).off('click');
        // Month--
        angular.element(headerSelectors[2]).off('click');
        // Month++
        angular.element(headerSelectors[3]).off('click');

        var pickers = document.querySelectorAll('div.ui-moment-wrapper');
        var picker;
        for (var j = 0; j < pickers.length; j++) {
          picker = angular.element(pickers[j]);
          picker.remove();
        }

        // reset onclick event listener
        $window.onclick = null;
      };

      /**
       * Remove the picker when click outside.
       * 
       * @method removePickerOnBadTarget
       * @private
       * @param {Object} event An event object
       */
      var removePickerOnBadTarget = function(event) {
        var targetElement = event.target;
        if (!targetElement || angular.element(targetElement).attr('ui-moment')!==undefined) {
          return;
        }

        if (!targetElement.classList.contains('js-ui-moment')) {
          removePicker();
          return;
        }
      };


      // scope functions


      // Event Handlers
      
      // on input blur
      //element.on('blur', removePicker);

      // on input click
      element.on('click', function(event) {
        // get the date in input else current date
        console.log('[Parse input date]');
        var dateToParse = angular.element(event.currentTarget).val(),
            enteredDate = $dateParser(dateToParse, pattern),
            enteredMoment = moment(enteredDate);
        console.log('[date to parse:'+dateToParse+']');
        if (enteredMoment.isValid()) {
          currMoment = enteredMoment;
          console.log('['+$filter('date')(currMoment.toDate(), pattern)+']');
        }
        renderPicker();
        event.preventDefault();
      });

      // on enter key press
      element.on('keyup', function (evt) {
        if (evt.keyCode === 13) {
          parseDate(evt);
        }
        else if (evt.keyCode === 27) {
          removePicker();
        }
      });

      scope.$on('$destroy', function () {
        console.log('Adios amigos...');
        // clean up event listeners
        //element.off('blur');
        element.off('click');
        element.off('keyup');
        // reset onclick event listener
        $window.onclick = null;
      });

      // init
      init();
    }
  };
}]);
