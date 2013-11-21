/* globals angular:true, moment:true, console:true */
/**
*
*
*
*
*/
angular.module('ui.moment', []);

angular.module('ui.moment').constant('uiMomentConfig', {});

angular.module('ui.moment').directive('uiMoment', ['uiMomentConfig', function (uiMomentConfig) {
  'use strict';
  var options;
  options = {};
  angular.extend(options, uiMomentConfig);

  return {
    require:'?ngModel',
    link: function postLink(scope, element, attrs, controller) {
      console.log('its here.  now: ' + moment()._d);
      console.log(arguments);
      // constants

      // directive variables
      var currOffset = 0;
      var currMoment = moment();  // the currently selected moment
      var pickerElem;
      var targetMoment = moment().add('months', currOffset); // the current month

      // scope variables


      // directive functions

      /**
      * Initialize the directive
      *
      * @method init
      * @private
      */
      var init = function () {
        pickerElem = angular.element(document.createElement('div'));
        pickerElem.addClass('ui-moment');
        pickerElem.html('<div class="header"><a class="pre-month"></a><span class="month"></span><span class="year"></span><a class="next-month"></a></div><table class="month-table"><thead><tr><th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th></tr></thead><tbody></tbody></table>');
        
        // add click handlers to the month toggle buttons
        var monthToggles = pickerElem.find('a');
        angular.element(monthToggles[0]).on('click', function () {
          renderPicker(--currOffset);
        });
        angular.element(monthToggles[1]).on('click', function () {
          renderPicker(++currOffset);
        });
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
        var enteredMoment = moment(angular.element(evt.currentTarget).val());

        // update the model if one was provided
        if (controller) {
          controller.$setViewValue(enteredMoment.format('MM/DD/YYYY'));
          controller.$render();
          scope.$apply();
        }

        console.log(enteredMoment);
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
          controller.$setViewValue(currMoment.format('MM/DD/YYYY'));
          controller.$render();
          scope.$apply();
        }
        removePicker();
      };

      /**
      * Renders a given month within the moment picker. Accepts an optional offset.
      *
      * @method renderPicker
      * @private
      * @param {Number} [offset] An optional integer offset from the current month (0 by default).
      */
      var renderPicker = function (offset) {
        console.log('[renderPicker()]');
        // limit to 12 months back or 12 months forward
        offset = parseInt(offset, 10);
        if (isNaN(offset)) {
          offset = 0;
        }

        targetMoment = moment().add('months', offset);
        
        // build out the month table
        // set the header text
        angular.element(pickerElem.find('span')[0]).html(targetMoment.format('MMMM'));
        angular.element(pickerElem.find('span')[1]).html(targetMoment.format('YYYY'));

        var rowHtml = '';
        // need be able to display 6 weeks at max
        for (var j = 0; j < 6; j++) {
          rowHtml += '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
        }
        pickerElem.find('tbody').html(rowHtml);

        var dayElems = pickerElem.find('td');
        // clear cell contents, classes and click handlers
        dayElems.html('');
        dayElems.removeClass('day');
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
          currElem.on('click', pickDate);
          //console.log(currElem);

          tdIdx++;
        }

        element.after(pickerElem);
      };

      var removePicker = function () {
        console.log('[removePicker()]');
        // clean up event listeners
        pickerElem.find('td').off('click');
        element.next().remove();
      };


      // scope functions


      // Event Handlers
      
      // on input blur
      //element.on('blur', parseDate);

      // on input focus
      element.on('focus', renderPicker);

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
      });

      // init
      init();
    }
  };
}]);