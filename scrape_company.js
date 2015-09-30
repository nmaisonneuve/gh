
var webPage = require('webpage');
var fs = require('fs');
var system = require('system');


// get the filename from argument system
var args = system.args;
company_filename = args[1];
output_filename = args[2];
var data = [];

// load the csv file containing company names
var companies = [];
var fileContents = fs.read(company_filename);
var lines = fileContents.toString().split('\n');
for (var i = 0; i < lines.length; i++) {
    companies.push(lines[i].toString());
}
console.log(companies.length+ " companies loaded");


// create a web page from the PhantomJS framework
var page = new WebPage();
var testindex = 0;
var loadInProgress = false;

page.onConsoleMessage = function(msg) {
    console.log(msg);
};

page.onLoadStarted = function() {
    loadInProgress = true;
    //console.log("load started");
};

page.onLoadFinished = function() {
    loadInProgress = false;
    //console.log("load finished");
};


// generate all the steps of the scraping process
var steps = [];
steps.push(function() {
    //Load Login Page
    page.open("https://www.linkedin.com/uas/login");
});

steps.push(function() {
    //Enter Credentials
    page.evaluate(function() {
        document.getElementById("session_key-login").value = "n.maisonneuve@gmail.com";
        document.getElementById("session_password-login").value = "astiko";
        console.log("user/pass setted ... ");
    });
});

steps.push(function() {
    //submit Login
    page.evaluate(function() {
        console.log("logging in ... ");
        var form = document.getElementById("login");
        form.submit();
    });
});

// optional 
// steps.push(function() {
//   // check everything is good 
//     page.evaluate(function() {
//         console.log("logged in ... " + document.querySelectorAll('title')[0].outerHTML);
//         console.log("Opening Search page");
//     });
// });

var k = -1;
for (var i = 0; i < companies.length; i++) {
  
  // open the search for a given company name
  steps.push(function() {
      k++;
      var url = "https://www.linkedin.com/vsearch/c?keywords="+ companies[k] +"&trk=vsrp_companies_sel&openFacets=N,CCR,JO&f_CCR=fr%3A0&orig=FCTD";
      page.open(url);    
  });

  // extract the first result
  steps.push(function(){
     var company = companies[k];
    page.evaluate(function(company, data) {         
      var results = Array.prototype.slice.call(document.getElementById("results").getElementsByTagName("h3"));
      ref = results[0].getElementsByTagName('a')[0].href;
      title = results[0].getElementsByTagName('a')[0].innerHTML;      
      ref = ref.replace(/\?.*/,"")      // we remove all the query parameters    

      //TODO 
      // check if the name is quite similar 
      // (do we really care if what we do is raw?)

      data.push([company, title, ref]);  // save the company name , title from linkedin, url 
    },company, data);
  });
}


// run the steps with a interval sleep of 1s 
interval = setInterval(function() {
    if (!loadInProgress && typeof steps[testindex] == "function") {
        //console.log("step " + (testindex + 1));
        steps[testindex]();
        testindex++;
    }
    if (typeof steps[testindex] != "function") {
        console.log("test complete!");
        phantom.exit();
    }
}, 100);


// save results
content = data.join("\n")
fs.write(output_filename, content, 'w');
