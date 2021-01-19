
var app = angular.module("blogApp", ["ngRoute"]);

app.controller("body", function ($scope, $location) {
    // Bind getDate function to scope var
    $scope.currentYear = getYear();
});

app.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "views/news.html",
            controller: "newsCtrl"
        })
        .when("/create", {
            templateUrl: "views/create.html",
            controller: "createCtrl"
        })
        .when("/about", {
            templateUrl: "views/about.html",
            controller: "aboutCtrl"
        })
        .when("/faq", {
            templateUrl: "views/faq.html",
            controller: "faqCtrl"
        })
        .when("/login", {
            templateUrl: "views/login.html",
            controller: "loginCtrl"
        })
        .otherwise({
            template: "<h1>404 I got no clue Fam</h1>"
        });

});

/** Menu controller */
app.controller("menuCtrl", function ($scope, $location, $http) {
    // Menu: control visibility of app pages
    $scope.visiblePageId = '';
    //click event
    $scope.showPage = function (pageId) {
        $scope.visiblePageId = pageId;
        $location.path(pageId);
    }
    //change url event
    $scope.$watch(function () {
        return $location.path();
    }, function (value) {
        $scope.visiblePageId = value;
    })
});


/** News controller */
app.controller("newsCtrl", function ($scope, newsFactory) {
    $scope.newscontent = newsFactory.arr;
    newsFactory.load();
});

/** Create controller */
app.controller("createCtrl", function ($scope, newsFactory, $http, $location) {

    $http({
        method: "GET",
        url: "/checkLogIn"
    }).then(function (response) {
        $scope.isLoggedIn = response.data;
        if (response.data == false) {
            $location.path("/login");
        } else {
            $location.path("/create");
        }
    });

    //create news post
    $scope.currentDate = getDate();
    $scope.addNews = function (title, content, author, tags) {
        newsFactory.add(title, content, author, tags, $scope.currentDate);
        //reset form
        $scope.title = "";
        $scope.author = "";
        $scope.content = "";
        $scope.tags = "";
    }

    $scope.logout = function () {
        $http({
            method: "GET",
            url: "/logout"
        }).then(function (response) {
            console.log("response: " + response);
            if (response.data == false) {
                console.log(response.data);
            } else {
                $scope.isLoggedIn = false;
                $location.path("/");
            }
        });
    }
});

app.controller("loginCtrl", function ($scope, $http, $location) {
    $scope.login = (username, pass) => {
        $http({
            method: "POST",
            url: "/login",
            data: angular.toJson({
                "username": username,
                "password": pass
            }),
            headers: { 'Content-Type': 'application/json' }
        }).then(function onSuccess(response) {
            if (response.data == true) {
                console.log("Login success");
                $scope.isLoggedIn = response.data;
                $location.path('/create');
            }
            else {
                $scope.errorMessage = "Wrong username or password";
            }
        }, function onError(error) {
            console.log(error);
        });
    }
});
/** About controller */
app.controller("aboutCtrl", function ($scope) {
    $scope.aboutHeader = "About";
    $scope.aboutContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse quis finibus ligula, in volutpat dolor. Cras malesuada auctor cursus. Maecenas mattis posuere lobortis. Praesent imperdiet congue dolor, nec blandit massa. Etiam dignissim erat eros, ut placerat nibh accumsan at. Mauris tempor hendrerit vehicula. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nullam vel molestie justo, nec elementum nulla. Quisque ligula nunc, sollicitudin sed lacinia id, volutpat eu purus. Mauris rhoncus nisl vel leo ornare tincidunt.";
});

/** FAQ controller */
app.controller("faqCtrl", function ($scope) {
    var coll = document.getElementsByClassName("collapsible");
    var i, j;

    for (i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function () {

            //hide other question
            var activeList = document.getElementsByClassName("active");
            if (activeList.length > 0) {
                for (j = 0; j < activeList.length; j++) {
                    var othercontent = activeList[j].nextElementSibling;
                    othercontent.style.maxHeight = null;
                    activeList[j].classList.toggle("active");
                }
            }

            //show clicked question
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";

            }
        });
    }
});

/** My factory */
app.factory('newsFactory', function ($http) {
    var newscontent = {};
    newscontent.arr = [];
    newscontent.load = function () {
        $http({
            //AJAX request
            method: "GET",
            url: "/getnews"
        }).then(function (response) {
            //manage response
            newscontent.arr.length = 0; // Clear array
            var items = angular.fromJson(response.data.arr);
            items.forEach((news) => newscontent.arr.push(news));
        });
    }

    newscontent.add = (tit, cont, auth, tag, createDate) => {
        $http({
            method: "POST",
            url: "/writenews",
            data: angular.toJson({
                "title": tit,
                "content": cont,
                "author": auth,
                "tags": tag,
                "createDate": createDate
            }),
            headers: { 'Content-Type': 'application/json' }
        }).then(function onSuccess(response) {
            console.log("Added task");
        }, function onError(error) {
            console.log(error);
        });
    }
    return newscontent;
});

function getDate() {
    let d = new Date();
    return d.toLocaleDateString("en-au", { month: 'long', day: 'numeric' }) + ", " +
        d.toLocaleDateString("en-au", { year: 'numeric' });
}

function getYear() {
    let d = new Date();
    return d.toLocaleDateString("en-au", { year: 'numeric' });
}