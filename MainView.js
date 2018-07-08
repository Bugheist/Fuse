var Observable = require("FuseJS/Observable");
var search_field = exports.search_field = Observable("");
var loading_visible = exports.loading_visible = Observable("");
var issue_data = exports.issue_data = Observable("");
var loadingNewFeed = Observable(true);
var searchbox_field = exports.searchbox_field = Observable("");
var appendingData = Observable(false);
var appendinguserData = Observable(false);
var searchflag = Observable(false);
var paginationOffset = 1;
var userpaginationOffset = 1;
var search_data = exports.search_data = Observable("");
var leaderboarddata = exports.leaderboarddata = Observable("");
var api_url = "https://www.bugheist.com/api/v1/"
var FileSystem = require("FuseJS/FileSystem");
var Storage = require("FuseJS/Storage");
var first_launch = FileSystem.dataDirectory + "/" + "first_launch_data.json";
first_launch_flag = Observable(true);
checkfirst_launch();
var screenshotupload =  Observable("Upload");
var cameraRoll = require("FuseJS/CameraRoll");
var username = Observable("");
var password = Observable("");
var usertoken = Observable("1");
var loginflag = Observable(false);
var loginerror = Observable("");
var loading = Observable("false");
var user_id = Observable("");
var user = exports.user = Observable("");
var logintab = Observable("Login");
var username = Observable("");
var userimage = Observable("");
var userfollows = Observable("");
var usersaved = Observable("");
var usertitle = Observable("");
var userwinning = Observable("");
var userupvoted = Observable("");
var loginstate = Observable("");
function logout() {
    loginstate.value = "loginpage";
    loginflag.value  = false;
    usertoken.value = "";
    logintab.value = "Login";
    Storage.write(tokenfile,"");
}
function fetch_user(appendData){
    urlprofile = api_url + 'profile/?search=' + appendData;
    fetch(urlprofile, {
                method: 'GET',
                 }).then(function(response) {
                    return response.json();
                }).then(function(responseObject) {
                    user.replaceAll(responseObject.results);
                    for(i in user._values){
                        if(user._values[i].user.id == user_id.value){
                             if (user._values[i].title == 0)
                               user._values[i].title = 'Null';
                else if (user._values[i].title == 1)
                    user._values[i].title = "Bronze";
                else if (user._values[i].title == 2)
                    user._values[i].title = "Silver";
                else if (user._values[i].title == 3)
                   user._values[i].title = "Gold";
                            break;
                        }
                    }
                    username.value = user._values[i].user.username;
                    userimage.value = user._values[i].user_avatar;
                    userfollows.value = user._values[i].follows;
                    usersaved.value = user._values[i].issue_saved;
                    usertitle.value = user._values[i].title;
                    userwinning.value = user._values[i].winnings;
                    userupvoted.value = user._values[i].issue_upvoted;
                    var storeObject = {
                        token: usertoken.value,
                        id: user_id.value
                    };
                    Storage.write(tokenfile, JSON.stringify(storeObject));
                });
}
function login() {
    loading.value = true;
    if(username.value=="" && password.value==""){
        loginerror.value = "Please Enter Username and Password" ;
        return;
    }
    else if(username.value=="")    {
        loginerror.value = "Please Enter Username" ;
        return;
    }
    else if(password.value==""){
        loginerror.value = "Please Enter Password" ;
        return;
    }
    var obj = {"username":username.value, "password":password.value};
    loginurl = "https://www.bugheist.com/authenticate/";
    fetch(loginurl, {
        method: 'POST',
        headers: { "Content-type": "application/json"},
        body: JSON.stringify(obj)
    }).then(function(response) {
    status = response.status;  // Get the HTTP status code
    response_ok = response.ok; // Is response.status in the 200-range?
    return response.json();    // This returns a promise
    }).then(function(responseObject) {
        if(responseObject.token == null){
        loginflag.value  = false;
        loginerror.value = "Incorrect Username & Password" ;
        }
        else{
            loginstate.value = "loggedin";
            logintab.value = "Profile";
            loginerror.value = "";
            loginflag.value = true;
            usertoken.value = responseObject.token;
            user_id.value = responseObject.id;
            fetch_user(user_id.value);
            }
    }); 
}
    
leaderboard();
searchIssues();
function checkfirst_launch() {
    Storage.read(first_launch).then(function(content) {
        first_launch_flag.value = false;
        var data = JSON.parse(content);
        console.log(first_launch)
    }, function(error) {
        var storeObject = {
            first_launch: false
        };
        first_launch_flag.value = true;
        leaderboard();
        Storage.write(first_launch, JSON.stringify(storeObject));
    });
}
var tokenfile = FileSystem.dataDirectory + "/" + "user_auth.json";
checkuser();
function checkuser(){
Storage.read(tokenfile).then(function(content) {
        var data = JSON.parse(content);
        console.log(JSON.stringify(data.token));
        if(data.id != null)
        logintab.value = "Profile";
        loginflag.value = true;
        usertoken.value = data.token;
        user_id.value = data.id;
        fetch_user(data.id);
        loginstate.value = "loggedin";
    }, function(error) {
            loginstate.value = loginpage;
});
}
var a;
var searchtype = Observable("0");
function selectimage(){
    cameraRoll.getImage()
    .then(function(image) {
        screenshotupload.value= image.path;
    }, function(error) {
    });
}

function search() {
    if (currentMode.value == '0') {
        urlsearch = api_url + 'issues/?search=' + searchbox_field.value;
    } else if (currentMode.value == '1') {
        urlsearch = api_url + 'profile/?search=' + searchbox_field.value;
    } else if (currentMode.value == '2') {
        urlsearch = api_url + 'domain/?search=' + searchbox_field.value;
    } else
        return;
    fetch(urlsearch, {
            method: 'GET',
        }).then(function(response) {
            return response.json();
        })
        .then(function(responseObject) {
            for (j in responseObject.results) {
                if(currentMode.value!='1'){
                responseObject.results[j].modified = responseObject.results[j].modified.slice(0, 10);
                responseObject.results[j].created = responseObject.results[j].created.slice(0, 10);
                if (responseObject.results[j].label == 0)
                    responseObject.results[j].label = "General";
                else if (responseObject.results[j].label == 1)
                    responseObject.results[j].label = "Number Error";
                else if (responseObject.results[j].label == 2)
                    responseObject.results[j].label = "Functional";
                else if (responseObject.results[j].label == 3)
                    responseObject.results[j].label = "Performance";
                else if (responseObject.results[j].label == 4)
                    responseObject.results[j].label = "Security";
                else if (responseObject.results[j].label == 5)
                    responseObject.results[j].label = "Typo";
                else
                    responseObject.results[j].label = "Design";
                responseObject.results[j].created = responseObject.results[j].created.slice(0, 10);
            }
            if(currentMode.value == '1'){
                if (responseObject.results[j].title == 0)
                   responseObject.results[j].title = 'Null';
                else if (responseObject.results[j].title == 1)
                   responseObject.results[j].title = "Bronze";
                else if (responseObject.results[j].title == 2)
                    responseObject.results[j].title = "Silver";
                else if (responseObject.results[j].title == 3)
                    responseObject.results[j].title = "Gold";
            }
}   
            search_data.replaceAll(responseObject.results);
        });
    searchflag.value = true;
    searchtype.value = currentMode.value;
}

function leaderboard() {
    urlleaderboard = api_url + 'userscore';
    fetch(urlleaderboard, {
        method: 'GET',
    }).then(function(response) {
        return response.json();
    }).then(function(responseObject) {
        for (i in responseObject) {
            if (responseObject[i].title_type.title == 0)
                responseObject[i].title_type.title = null;
            else if (responseObject[i].title_type.title == 1)
                responseObject[i].title_type.title = "Bronze";
            else if (responseObject[i].title_type.title == 2)
                responseObject[i].title_type.title = "Silver";
            else if (responseObject[i].title_type.title == 3)
                responseObject[i].title_type.title = "Gold";
            responseObject[i].image.user_avatar = "https://bhfiles.storage.googleapis.com/" + responseObject[i].image.user_avatar;

        }
        leaderboarddata.replaceAll(responseObject);
    })
}

function searchIssues(appendData) {
    if (loading_visible.value == true || paginationOffset >= 31)
        return;

    loading_visible.value = true;
    appendingData.value = appendData;

    if (search_field.value) {
        if (appendingData.value == true) {
            url = api_url + 'issues/?search=' + search_field.value + '&page=' + paginationOffset;
        } else {
            url = api_url + 'issues/?search=' + search_field.value;
        }

    } else {
        url = api_url + 'issues/?page=' + paginationOffset;
    }
    fetch(url, {
            method: 'GET',

        }).then(function(response) {
            return response.json();
        })
        .then(function(responseObject) {
    
                for (j in responseObject.results) {
                    responseObject.results[j].modified = responseObject.results[j].modified.slice(0, 10);
                    responseObject.results[j].created = responseObject.results[j].created.slice(0, 10);
                    if (responseObject.results[j].label == 0)
                        responseObject.results[j].label = "General";
                    else if (responseObject.results[j].label == 1)
                        responseObject.results[j].label = "Number Error";
                    else if (responseObject.results[j].label == 2)
                        responseObject.results[j].label = "Functional";
                    else if (responseObject.results[j].label == 3)
                        responseObject.results[j].label = "Performance";
                    else if (responseObject.results[j].label == 4)
                        responseObject.results[j].label = "Security";
                    else if (responseObject.results[j].label == 5)
                        responseObject.results[j].label = "Typo";
                    else
                        responseObject.results[j].label = "Design";
                    if (responseObject.results[j].user == null)
                        responseObject.results[j].user = 'False';
                }
                 if (appendingData.value == true) {
                    issue_data.addAll(responseObject.results);
                    appendingData.value = true;
                } 
                else{   
                    issue_data.replaceAll(responseObject.results);
                    appendingData.value = true;
                }

                    if (responseObject.next == null){
                        appendingData.value = false;
                        return;
                    }
                loading_visible.value = false;
                loadingNewFeed.value = false;
                paginationOffset++;
            });
}

var open = Observable("0");
var closed = Observable("0");
var openCount = 0;
var closedCount = 0;

function count(callback) {
    var paging = 1;
    while(paging<=100) {
        url = api_url + 'issues/?page=' + paging;
        fetch(url, {
                method: 'GET',

            }).then(function(response) {
                return response.json();
            })
            .then(function(responseObject) {
                for (j in responseObject.results)
                    callback(responseObject.results[j]);
                if(responseObject.next==null)
                    return;
            });
            paging++;
    }
}

count(function(data) {
    if (data.status == "open")
        openCount++;
    else
        closedCount++;
    closed.value = closedCount;
    open.value = openCount;
});
createIssue = {
    "url": "",
    "description": "",
    "label": null,
    "screenshot": null
};

var Issuesite = Observable("");
var Issuedesc = Observable("");
var Issuedevice = Observable("");

function web() {
    Issuedevice.value = "web";
    return "abc";
}

function ios() {
    Issuedevice.value = "ios";
}

function android() {
    Issuedevice.value = "android";
}

function link() {
    Issuedevice.value = "url";
}

function saveIssuesite() {
    var storeObject = {
        Issuesite: Issuesite.value
    };
    return;
}

function reportIssue() {
    
    if (Issuetype.value == "general") {
        Issuetype.value = 0;
    } else if (Issuetype.value == "numbererror") {
        Issuetype.value = 1;
    } else if (Issuetype.value == "functional") {
        Issuetype.value = 2;
    } else if (Issuetype.value == "performance") {
        Issuetype.value = 3;
    } else if (Issuetype.value == "security") {
        Issuetype.value = 4;
    } else if (Issuetype.value == "typo") {
        Issuetype.value = 5;
    } else if (Issuetype.value == "design") {
        Issuetype.value = 6;
    }
    createIssue = {
        url: Issuesite.value,
        description: Issuedesc.value,
        label: Issuetype.value,
        screenshot: screenshotupload.value
    };
    reporturl = "http://192.168.0.101:8000/api/v1/createissues/";
    fetch(reporturl, {
        method: 'POST',
        headers: { "Content-type": "application/json"},
        body: JSON.stringify(createIssue)
    }).then(function(response) {
    status = response.status;  // Get the HTTP status code
    response_ok = response.ok; // Is response.status in the 200-range?
    return response.json();    // This returns a promise
    }).then(function(responseObject) {
    })
    return;
}

function back() {
    router.goBack();
}

function SearchPage() {
    router.push("search");
}

function HomePage() {
    first_launch_flag.value = false;
    var empty = new Object();
    search_data = empty;
    router.goto("home");
}
var isDialogShowing = Observable(false);

function showDialog() {
    isDialogShowing.value = true;
}

function closeDialog() {
    isDialogShowing.value = false;
}
var IssueList = {
    general: {
        label: "General"
    },
    numbererror: {
        label: "Number Error"
    },
    functional: {
        label: "Functional"
    },
    performance: {
        label: "Performance"
    },
    security: {
        label: "Security"
    },
    typo: {
        label: "Typo"
    },
    design: {
        label: "Design"
    },
};
var Issuetype = Observable("Issue Type");
Issuetype.onValueChanged(module, update);
var currentMode = Observable(0);
var modes = [{
        label: "Issue"
    },
    {
        label: "User"
    },
    {
        label: "Domain"
    }
];

function update() {
    return;
};

// converts our own options object into an array of options for an `Each`
function mapOptions(opts) {
    return Object.keys(opts).map(function(key) {
        return {
            value: key,
            label: opts[key].label
        };
    });
};
update();
module.exports = {
    username: username,
    userimage: userimage,
    userfollows: userfollows,
    usersaved: usersaved,
    usertitle: usertitle,
    userwinning: userwinning,
    userupvoted: userupvoted,
    logintab: logintab,
    logout: logout,
    loading: loading,
    loginerror: loginerror,
    loginflag: loginflag,
    username: username,
    password: password,
    login: login,
    screenshotupload: screenshotupload,
    selectimage: selectimage,
    back: back,
    searchtype: searchtype,
    checkfirst_launch: checkfirst_launch,
    first_launch_flag: first_launch_flag,
    leaderboard: leaderboard,
    currentMode: currentMode,
    modes: modes,
    searchflag: searchflag,
    search_data: search_data,
    searchbox_field: searchbox_field,
    search: search,
    SearchPage: SearchPage,
    leaderboarddata: leaderboarddata,
    appendingData: appendingData,
    count: count,
    open: open,
    closed: closed,
    HomePage: HomePage,
    Issuedevice: Issuedevice,
    IssueList: mapOptions(IssueList),
    web: web,
    ios: ios,
    android: android,
    link: link,
    Issuetype: Issuetype,
    Issuedesc: Issuedesc,
    Issuesite: Issuesite,
    search_field: search_field,
    loadingNewFeed: loadingNewFeed,
    searchIssues: searchIssues,
    dataSource: issue_data,
    isDialogShowing: isDialogShowing,
    showDialog: showDialog,
    closeDialog: closeDialog,
    reportIssue: reportIssue,
    loginstate: loginstate,
    fetchAppendData: function() {
        searchIssues(true)
    },
    goBack: function() {
        router.goBack();
    }

};
