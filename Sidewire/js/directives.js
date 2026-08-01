"use strict";

/* Directives */

Sidewire.directive("caRd", function($compile, $q) {
  /////

  return {
    restrict: "AE",
    scope: true,
    template: ""
  };
})
  .directive("cellWidth", function($window) {
    return {
      restrict: "AE",
      template: "",
      link: function(scope, element) {
        var w = angular.element($window);
        scope.getWindowDimensions = function() {
          return {
            h: w.height(),
            w: w.width()
          };
        };
        element.css({
          width: w.width() * 0.95
        });
        scope.$watch(
          scope.getWindowDimensions,
          function(newValue, oldValue) {
            scope.tableWidth = w.width() * 0.95;
          },
          true
        );

        w.bind("resize", function() {
          element.css({
            width: scope.tableWidth * 0.95
          });
          scope.$apply();
        });

        console.log(scope.tableWidth);
      }
    };
  })
  .directive("resizeTable", function($window) {
    return function(scope, element) {
      var w = angular.element($window);
      scope.getWindowDimensions = function() {
        return {
          h: w.height(),
          w: w.width()
        };
      };
      scope.$watch(
        scope.getWindowDimensions,
        function(newValue, oldValue) {
          scope.tableWidth = w.width();
        },
        true
      );

      w.bind("resize", function() {
        scope.$apply();
      });
    };
  })

  .directive("ngEnter", function() {
    return function(scope, element, attrs) {
      element.bind("keydown keypress", function(event) {
        if (event.which === 13) {
          scope.$apply(function() {
            scope.$eval(attrs.ngEnter);
          });

          event.preventDefault();
        }
      });
    };
  })
  .directive("wpVideos", function() {
    return {
      restrict: "AE",
      scope: true,

      link: function(scope, element, attr) {
        attr.$observe("flashvars", function(value) {
          if (value != "") {
            element.html(
              '<embed type="application/x-shockwave-flash" src="http://s0.videopress.com/player.swf?v=1.03" width="' +
                attr.width +
                '" height="' +
                attr.height +
                '" wmode="direct" seamlesstabbing="true" allowfullscreen="true" allowscriptaccess="always" overstretch="true" flashvars="guid=' +
                scope.src.src +
                '&amp;isDynamicSeeking=true">'
            );
          } else {
            element.html("<div>NO Video</div>");
            // We have to put something into the DOM
          }
        });
      }
    };
  })
  .directive("ngDelay", [
    "$timeout",
    function($timeout) {
      return {
        restrict: "A",
        scope: true,
        compile: function(element, attributes) {
          var expression = attributes["ngChange"];
          if (!expression) return;

          var ngModel = attributes["ngModel"];
          if (ngModel) attributes["ngModel"] = "$parent." + ngModel;
          attributes["ngChange"] = "$$delay.execute()";

          return {
            post: function(scope, element, attributes) {
              scope.$$delay = {
                expression: expression,
                delay: scope.$eval(attributes["ngDelay"]),
                execute: function() {
                  var state = scope.$$delay;
                  state.then = Date.now();
                  $timeout(function() {
                    if (Date.now() - state.then >= state.delay)
                      scope.$parent.$eval(expression);
                  }, state.delay);
                }
              };
            }
          };
        }
      };
    }
  ]);

Sidewire.directive("downloadButton", function($compile) {
  return {
    restrict: "AE",
    link: function(scope, elem, attrs) {
      var data = {};
      attrs.$observe("data", function() {
        var data = attrs.data;

        var blob = new Blob([data], { type: "application/json" });
        var url = URL.createObjectURL(blob);

        elem.html(
          $compile(
            '<a  download="data.json"' +
              'href="' +
              url +
              '">' +
              '<span class="icon-folder-download"></span>' +
              "</a>"
          )(scope)
        );
      });
    }
  };
}).directive("eventDelegate", function($parse) {
  // I bind the DOM and event handlers to the scope.
  function link($scope, element, attributes) {
    // Right now, the delegate can be defined as
    // either selector and an expression; or simply
    // as an expression.
    var config = attributes.eventDelegate.split("|");
    var eventtype = attributes.type;
    // Only an expression has been defined - default
    // the selector to any anchor link.
    if (config.length === 1) {
      var selector = "a";
      var expression = config[0];
      // Both selector and expression are defined.
    } else {
      var selector = config[0];
      var expression = config[1];
    }
    // Parse the expression into an invokable
    // function. This way, we don't have to re-parse
    // it every time the event handler is triggered.
    var expressionHandler = $parse(expression);
    // Bind to the click (currently only supported
    // event type) to the root element and listen for
    // clicks on the given selector.
    element.on(eventtype + ".eventDelegate", selector, function(event) {
      // Prevent the default behavior - this is
      // not a "real" link.
      event.preventDefault();
      // Find the scope most local to the target
      // of the click event.
      var localScope = $(event.target).scope();
      // Invoke the expression in the local scope
      // context to make sure we adhere to the
      // proper scope chain prototypal inheritance.
      localScope.$apply(function() {
        expressionHandler(localScope);
      });
    });

    // When the scope is destroyed, clean up.
    $scope.$on("$destroy", function(event) {
      element.off(eventtype + ".clickDelegate");
    });
  }

  // Return the directive configuration.
  return {
    link: link,
    restrict: "A"
  };
});
