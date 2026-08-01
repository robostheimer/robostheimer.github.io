/**
 * Created by jostheim on 3/9/15.
 */
Sidewire.factory("Sources", [
  "$http",
  function($http) {
    return {
      index: function(uid) {
        var url = rootCurationApiUrl + "direct_commentary/";
        return $http.get(url);
      },
      post: function(
        commentatorUid,
        articleUid,
        text,
        fullText,
        readMoreLink,
        articleUrl
      ) {
        var url = rootCurationApiUrl + "commentary/";
        var data = {
          commentator_uid: commentatorUid,
          direct_commentaries: [
            {
              text: text,
              full_text: fullText,
              read_more_link: readMoreLink,
              article_uid: articleUid,
              article_url: articleUrl,
              timestamp: new Date()
            }
          ]
        };
        return $http.post(url, data);
      }
    };
  }
]);

Sidewire.factory("CurationService", [
  "$http",
  "ArticleService",
  "$log",
  "$cacheFactory",
  "$q",
  function($http, ArticleService, $log, $cacheFactory, $q) {
    return {
      get: function() {
        d = new Date();
        var url = mainFeedCurationUrl + "?cache_breaker=" + d.getTime();
        return $http.get(url).then(
          function(result) {
            return result;
          },
          function(result) {
            $log.error(result.data.message);
            //AlertService.add("error", "Unable to get user");
          }
        );
      },
      get_and_update: function() {
        var cache = $cacheFactory.get("contentCache");
        if (_.isUndefined(cache)) {
          var cache = $cacheFactory("contentCache");
        }
        var contentData = cache.get("contentData");
        if (_.isUndefined(contentData)) {
          return this.get()
            .then(
              function(results) {
                return results.data;
              },
              function(results) {
                $log.error(result.data.message);
              }
            )
            .then(
              function(curatedData) {
                var articleUids = [];
                for (var i = 0; i < curatedData.length; i++) {
                  articleUids.push(curatedData[i].uid);
                }
                return ArticleService.index(articleUids).then(
                  function(result) {
                    var contentData = result.data;
                    for (var i = 0; i < contentData.length; i++) {
                      for (var j = 0; j < curatedData.length; j++) {
                        if (contentData[i].source.uid == curatedData[j].uid) {
                          contentData[i].source.subject = curatedData[j].topic;
                        }
                      }
                    }
                    $log.debug(contentData);
                    cache.put("contentData", contentData);
                    return contentData;
                  },
                  function(result) {
                    $log.error(result.data.message);
                  }
                );
              },
              function() {
                $log.error(result.data.message);
              }
            );
        } else {
          var deferred = $q.defer();
          var promise = deferred.promise;
          deferred.resolve(contentData);
          return promise;
          //return contentData;
        }
      }
    };
  }
]);

Sidewire.factory("CommentatorService", [
  "$http",
  function($http) {
    return {
      get: function(commentatorUid) {
        var url =
          rootCurationApiUrl + "commentator?commentator_uid=" + commentatorUid;
        return $http.get(url);
      },
      getStats: function(commentatorUid) {
        var url =
          rootContentApiUrl +
          "presspass/?commentator_uid=" +
          commentatorUid +
          "&kind=direct";
        return $http.get(url);
      }
    };
  }
]);

Sidewire.factory("ArticleService", [
  "$http",
  function($http) {
    return {
      get: function(articleUid) {
        var url =
          rootContentApiUrl +
          "simpleContent/?source=" +
          articleUid +
          "&context_type=article&direct=True";
        return $http.get(url).then(
          function(result) {
            var article = result.data.source;
            //article.authors = ['testeter tester', 'tester2 tester2', 'tester3, tester3']
            if (article.authors != null && article.authors.length > 0) {
              var authorArticleString = article.authors[0];
              if (article.authors.length > 1) {
                var authorArticleString = article.authors[0];
                for (var i = 1; i < article.authors.length; i++) {
                  if (i + 1 == article.authors.length) {
                    authorArticleString += " and ";
                  } else {
                    authorArticleString += ", ";
                  }
                  authorArticleString += article.authors[i];
                }
              }
            }
            article.authorArticleString = authorArticleString;
            switch (article.source) {
              case "CNN":
                article.source_image = "../img/cnn@2x.png";
                break;
              case "Bloomberg":
                article.source_image = "../img/bloomberg@2x.png";
                break;
              case "Fox News":
                article.source_image = "../img/fox_news@2x.png";
                break;
              case "MSNBC":
                article.source_image = "../img/msnbc@2x.png";
                break;
              case "ABC News":
                article.source_image = "../img/abc_news@2x.png";
                break;
              case "NBC News":
                article.source_image = "../img/nbc_news@2x.png";
                break;
              case "CBS News":
                article.source_image = "../img/cbs_news@2x.png";
                break;
              case "Forbes":
                article.source_image = "../img/forbes_news@2x.png";
                break;
              case "Wall Street Journal":
                article.source_image = "../img/wall_street_journal@2x.png";
                break;
              case "USA Today":
                article.source_image = "../img/usa_today@2x.png";
                break;
              case "NPR":
                article.source_image = "../img/npr@2x.png";
                break;
              case "Huffington Post":
                article.source_image = "../img/huffington_post@2x.png";
                break;
              case "The Hill":
                article.source_image = "../img/the_hill@2x.png";
                break;
              case "National Journal":
                article.source_image = "../img/national_journal@2x.png";
                break;
              case "New York Times":
                article.source_image = "../img/new_york_times@2x.png";
                break;
              case "Slate":
                article.source_image = "../img/slate@2x.png";
                break;
              case "Washington Post":
                article.source_image = "../img/washington_post@2x.png";
                break;
              case "Politico":
                article.source_image = "../img/politico@2x.png";
                break;
              case "Associated Press":
                article.source_image = "../img/associated_press@2x.png";
                break;
              case "Yahoo News":
                article.source_image = "../img/yahoo_news@2x.png";
                break;
            }
            return article;
          },
          function(result) {
            $log.error(result.data.message);
          }
        );
      },
      index: function(articleUids) {
        var url = "/";
        console.log(url);
        var postData = { send_images: true, sources: [] };
        for (var i = 0; i < articleUids.length; i++) {
          postData["sources"].push({ source: articleUids[i] });
        }
        //postData['sources'] = [{"source": 'e4a8207cef2a460ed652c88eac5425a1'}, {"source": 'a9c109efdf93c1a0ba23ee095671d804'}, {"source": '87713065702c6f5fe51bf10e93aaa625'}]
        return $http.post(url, postData);
      }
    };
  }
]);

Sidewire.factory("SidewireData", [
  "$http",
  "LS",
  "$q",
  "$rootScope",
  "$timeout",
  function($http, LS, $q, $rootScope, $timeout) {
    return {
      getSourcesData: function() {
        return $http.get("json/sources.json").then(function(data) {
          data.data.sources.forEach(function(item) {
            item.Edit = false;
            item.httpThere = true;

            item.Edit = false;

            for (var prop in item) {
              if (item.hasOwnProperty(prop)) {
                if (item[prop] == null) {
                  item[prop] = "null";
                }
              }
            }
            LS.checkLS(item, data.data.sources);
          });

          return data;
        });
      },
      getContextsData: function() {
        return $http.get("json/contexts.json").then(function(data) {
          data.data.contexts.forEach(function(item) {
            item.Edit = false;
            item.httpThere = true;
            for (var prop in item) {
              if (item.hasOwnProperty(prop)) {
                if (item[prop] == null) {
                  item[prop] = "null";
                }
              }
            }
            LS.checkLS(item, data.data.contexts);
          });

          return data;
        });
      },
      runPost: function(data) {
        console.log(data);
        $http.post("post.html", data).success(function(response) {
          console.log(response);
          $rootScope.postMessage = true;
          console.log($rootScope.postMessage);
          $timeout(function() {
            $rootScope.postMessage = false;
          }, 5000);
        });
      }
    };
  }
]);

Sidewire.factory("Buttons", [
  "$q",
  function($q) {
    return {
      changeButton: function(nav, type) {
        var deferred = $q.defer();

        nav.forEach(function(item) {
          if (type == item.type) {
            item.state = "on";
          } else {
            item.state = "off";
          }
        });
        deferred.resolve(nav);
        return deferred.promise;
      },
      toggle: function(buttons, type) {
        buttons.forEach(function(button) {
          if (type == button.type && button.state == "on") {
            button.state = "off";
          } else if (type == button.type && button.state == "off") {
            button.state = "on";
          } else {
            button.state = "off";
          }
        });

        console.log(buttons);
      },
      changeOrder: function(data, parameter, asc_or_dsc, str_or_num) {
        var deferred = $q.defer();
        if (asc_or_dsc == "asc") {
          //$scope.alldata.fullArr=$scope.alldata_all
          data = data.SortObjAsc(
            parameter.toLowerCase(),
            str_or_num,
            "feed_url"
          );
        } else {
          //$scope.alldata.fullArr=$scope.alldata_all
          data = data.SortObjDsc(
            parameter.toLowerCase(),
            str_or_num,
            "feed_url"
          );
        }
        deferred.resolve(data);
        return deferred.promise;
      }
    };
  }
]);

Sidewire.factory("BrowseSearch", [
  "$q",
  function($q) {
    return {
      SearchData: function(arr, query, checkDupProperty) {
        var deferred = $q.defer();
        var searchArr = { arr: [], fullArr: [] };
        var searchArr = arr.searchDataMatch(query, checkDupProperty);
        deferred.resolve(searchArr);
        return deferred.promise;
      }
    };
  }
]);

Sidewire.factory("Validate", [
  "$q",
  function($q) {
    return {
      isEmpty: function(obj) {
        var deferred = $q.defer();
        for (var prop in obj) {
          if (obj[prop] == "" && !prop.match("whitelist")) {
            console.log(obj);
            deferred.resolve(true);
            return deferred.promise;
          }
        }

        deferred.resolve(false);
        return deferred.promise;
      },
      hasHTTP: function(str) {
        var deferred = $q.defer();
        deferred.resolve(/http/.test(str));
        return deferred.promise;
      }
    };
  }
]);

Sidewire.factory("LS", [
  "$http",
  "$routeParams",
  "$location",
  "$rootScope",
  "$sce",
  function($http, $routeParams, $location, $rootScope, $sce) {
    return {
      checkLS: function(obj, arr) {
        if (
          localStorage.getItem("deleted") != null &&
          localStorage.getItem("deleted") != ""
        ) {
          var LSArr = jQuery.parseJSON(localStorage.getItem("deleted"));
        } else {
          LSArr = [];
          //favorites.blogHider=true;
        }
        //	console.log(LSArr)
        LSArr.forEach(function(ls) {
          if (ls.id == obj.id) {
            var index = arr.indexOf(obj);
            arr.splice(index, 1);
          }

          return obj;
        });
      }
    };
  }
]);
