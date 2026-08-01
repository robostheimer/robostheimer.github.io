SidewireBlackApp.controller("MainController", [
  "$scope",
  "ArticleService",
  "DirectCommentaryService",
  "CurationService",
  "CommentatorService",
  "$log",
  "$routeParams",
  "$route",
  "$location",
  function(
    $scope,
    ArticleService,
    DirectCommentaryService,
    CurationService,
    CommentatorService,
    $log,
    $routeParams,
    $route,
    $location
  ) {
    $scope.direct_commentary = { text: "" };
    $scope.moreToSay = false;
    $scope.commentary_open = false;
    $scope.currentDate = new Date();

    init();

    $scope.toggleMoreToSay = function() {
      if ($scope.moreToSay) {
        $scope.moreToSay = false;
      } else {
        $scope.moreToSay = true;
      }
    };

    $scope.toggleCommentary = function() {
      if (
        !$scope.commentary_open &&
        $scope.article.direct_commentary != null &&
        $scope.article.direct_commentary.length > 0
      ) {
        $scope.commentary_open = true;
      } else {
        commentary_open = false;
      }
    };

    $scope.publish = function() {
      DirectCommentaryService.post(
        $scope.commentatorUid,
        $scope.article.uid,
        $scope.direct_commentary.text,
        $scope.direct_commentary.full_text,
        $scope.direct_commentary.read_more_link,
        $scope.article.url
      ).then(
        function(result) {
          alert("Commentary published!");
          ArticleService.get($scope.articleUid).then(
            function(result) {
              $scope.article = result;
              $log.info($scope.article);
            },
            function(result) {
              $log.error(result.data.message);
            }
          );
        },
        function(result) {
          $log.error(result.data.message);
        }
      );
    };

    function init() {
      $scope.$broadcast("REFRESH");
      $scope.articleUid = $routeParams.article_uid;
      $scope.commentatorUid = $routeParams.commentator_uid;
      $log.info($scope.articleUid);
      CommentatorService.get($scope.commentatorUid).then(
        function(results) {
          $scope.commentator = results.data;
        },
        function(results) {
          $log.error(result.data.message);
        }
      );
      if (!_.isUndefined($scope.articleUid)) {
        ArticleService.get($scope.articleUid).then(
          function(result) {
            $scope.article = result;
            $log.info($scope.article);
          },
          function(result) {
            $log.error(result.data.message);
          }
        );
      } else {
        CurationService.get_and_update().then(
          function(result) {
            $scope.contentData = result;
            if (!_.isUndefined($scope.contentData[0])) {
              $location.path(
                "/commentator/" +
                  $scope.commentatorUid +
                  "/main/" +
                  $scope.contentData[0].source.uid
              );
            } else {
              $location.path(
                "/commentator/" + $scope.commentatorUid + "/main/"
              );
            }
          },
          function(result) {
            $log.error(result.data.message);
          }
        );
      }
    }
  }
]);

SidewireBlackApp.controller("HotController", [
  "$scope",
  "CurationService",
  "ArticleService",
  "$log",
  "$route",
  "$location",
  function($scope, CurationService, ArticleService, $log, $route, $location) {
    init();
    $scope.show_contributors = false;
    $scope.show_hotlist = true;

    $scope.do_show_contributors = function() {
      $scope.show_hotlist = false;
      $scope.show_contributors = true;
    };

    $scope.do_show_hotlist = function() {
      $scope.show_hotlist = true;
      $scope.show_contributors = false;
    };

    $scope.change_location = function(uid) {
      for (var i = 0; i < $scope.contentData.length; i++) {
        $scope.contentData[i].source.active = false;
        if ($scope.contentData[i].source.uid == uid) {
          $scope.contentData[i].source.active = true;
        }
      }
      if (!_.isUndefined(uid)) {
        $location.path(
          "/commentator/" + $scope.commentatorUid + "/main/" + uid
        );
      } else {
        $location.path("/commentator/" + $scope.commentatorUid + "/main/");
      }
    };

    function init() {
      if ($route.current.params.commentator_uid) {
        $scope.commentatorUid = $route.current.params.commentator_uid;
      }
      if ($route.current.params.article_uid) {
        $scope.article_uid = $route.current.params.article_uid;
      }
      CurationService.get_and_update().then(
        function(result) {
          $scope.contentData = result;
          for (var i = 0; i < $scope.contentData.length; i++) {
            $scope.contentData[i].source.active = false;
            if ($scope.contentData[i].source.uid == $scope.article_uid) {
              $scope.contentData[i].source.active = true;
            }
          }
          if (_.isUndefined($scope.article_uid)) {
            $location.path(
              "/commentator/" +
                $scope.commentatorUid +
                "/main/" +
                $scope.contentData[0].source.uid
            );
          } else {
            $location.path(
              "/commentator/" +
                $scope.commentatorUid +
                "/main/" +
                $scope.article_uid
            );
          }
        },
        function(result) {
          $log.error(result.data.message);
        }
      );
    }
  }
]);
