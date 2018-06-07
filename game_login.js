//***************function to shuffle strings***********************// 
String.prototype.shuffle = function () {                                   
    var a = this.split(""),  
      n = a.length;  
    for(var i = n - 1; i > 0; i--) {  
      var j = Math.floor(Math.random() * (i + 1));  
      var tmp = a[i];  
      a[i] = a[j];  
      a[j] = tmp;  
    }  
    return a.join("");  
  }   
  //******************************useful variables***************//
    var valcompare='';  
  var totsecremain = 20;  
  var randomword='';  
  var shuffletext = '';  
  var findletter='';  
  var findletterindex=0;
  var k=0;  
  var score=0;  
  var wordtofind='';  
  var words = ["SPAM","COVEFEFE","ANGULAR","NIRVANA","SMIRNOFF","PREJUDICE","ROBOT","REGULATION","PATHFINDER","PALINDROME","CHRISTMAS","JHONNY"  ];  //stock array //
 //*********************function to access random word from stock array***********************// 
  function getRandomWord() {                                          
        
    var randomword =     words[Math.floor(Math.random() * words.length)];  
    valcompare=randomword[0];  
    wordtofind=randomword;
    return randomword;  
  };  
   wordtofind = getRandomWord(); 
   
  window.onload = function () {  
    CreateDynamicButtonWord();  
  };
   

  function launcher(e) {                               //function to initiate new rounds//
   var x=document.getElementById('score') ;
   var alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";   
   shuffletext=alphabets.shuffle();   
  //Fill grid with random characters in each cell 
       Fillcell();    
       StartTimer();  
   e.style.visibility = 'hidden';  
   document.getElementById("dvcountdown").style.visibility='';
   x.innerHTML="SCORE:   00"  
  } 
  /**********************adding 4 random letters to already randomised 26 then filling grid ***************************/ 
  function Fillcell()
  {  
    
  var finalshuffle='';  
  var addedfourletters='';  
  var addfourcount=0;  
  for(let u=0; u<shuffletext.length;u++ )  
  {  
   if(randomword.indexOf(shuffletext[u])>= -1)  
   {  
    if(addfourcount<4)  
    {  
    addedfourletters=addedfourletters+shuffletext[u];  
    addfourcount++;  
    }  
   }  
  }  
  shuffletext=shuffletext+addedfourletters;  
  finalshuffle=shuffletext.shuffle();  
  //Filing the final shuffled values in each cell  
  var arrcount=0;  
  var table = document.getElementById("table2");  
  for (var i = 0, row; row = table.rows[i]; i++) {  
    for (var j = 0, col; col = row.cells[j]; j++) {    
     var dv = table.rows[i].cells[j].getElementsByTagName("div")   
        arrcount=arrcount+1;  
        dv[0].innerHTML=finalshuffle[arrcount-1];  
        
    }   
  }  
  }  
 //************** starting timer at begining of each round *****************//
  function StartTimer() {  
    document.getElementById('dvcountdown').innerHTML = totsecremain + 'sec remaining';  
   totsecremain--;  
   if (totsecremain < -1) {  
    alert('Time up \n Your score : '+score);  
       SetInitials();  
   }  
   else {  
    setTimeout(StartTimer, 1000);  //rep after every 1 second//
   }  
  }
 // ******************** default conditions for each round ******************* //
  function SetInitials(){  
  document.getElementById("btnstart").style.visibility='';  
  document.getElementById("btnstart").style.visibility = 'block';  
  document.getElementById("dvcountdown").style.visibility='hidden';  
  totsecremain = 20;  
  findletterindex=0;  
  score=0;  
  getRandomWord();  
  k= wordtofind.length;
   var m = document.getElementById('wc');
   m.innerHTML=k;
  CreateDynamicButtonWord();  
  }  
  //***************checking function**********************//
  function CheckMatch(e){  
  if(document.getElementById("btnstart").style.visibility != 'hidden'){  
  alert("Please click 'start new game' button.");  
  return;  
  }  
    
  if(e.innerHTML === valcompare)  
  {   
       k--;
       var m = document.getElementById('wc');
       m.innerHTML=k;
       var x=document.getElementById('score') ;
       var table = document.getElementById("table1");  
       for (var i = 0, row; row = table.rows[i]; i++) {  
    for (var j = 0, col; col = row.cells[j]; j++) {    
     var btn = table.rows[i].cells[j].getElementsByTagName("button")
      if(btn.length>0)  
        {         
        btn[findletterindex].classList.remove("findbutton");  
        btn[findletterindex].className='successbutton';  
        if(k>0){
          btn[findletterindex + 1].className='findbutton';  
        valcompare=btn[findletterindex + 1].value;
        }  
        findletterindex++;  
        score=score+10;
        x.innerHTML="SCORE:   "+score;  
        } 
        }
  }
       if(k==0){                        /*********************** terminating condition *************/
            alert('Congratulations...You Won');
            alert('Your score : '+score);  
       SetInitials();    
       }
  }  
  }  
  //******************************************Creating Dynamic buttons*************************************//  
  function CreateDynamicButtonWord(){  
  var myNode = document.getElementById("dvword");  
       while (myNode.firstChild) {  
             myNode.removeChild(myNode.firstChild);  
       }
       k=wordtofind.length; 
   var m = document.getElementById('wc');
   m.innerHTML=k;  
  for(let i=0;i<wordtofind.length;i++)  
  {  
       var buttontag = document.createElement("button");  
       buttontag.setAttribute("type", "button");  
       buttontag.setAttribute("value", wordtofind[i]);  
       buttontag.innerHTML = wordtofind[i];  
       document.getElementById('dvword').appendChild(buttontag);  
      if(i==0){buttontag.className = "findbutton"; findletter=wordtofind[i]} 
      
  }  
  }


  //****adding login*****////
  /*function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
      // Logged into your app and Facebook.
      testAPI();
    } else {
      // The person is not logged into your app or we are unable to tell.
      document.getElementById('status').innerHTML = 'Please log ' +
        'into this app.';
    }
  }

  // This function is called when someone finishes with the Login
  // Button.  See the onlogin handler attached to it in the sample
  // code below.
  function checkLoginState() {
    FB.getLoginStatus(function(response) {
      statusChangeCallback(response);
    });
  }*/

  window.fbAsyncInit = function() {
    FB.init({
      appId      : '1867383380228253',
      cookie     : true,  // enable cookies to allow the server to access 
                          // the session
      xfbml      : true,  // parse social plugins on this page
      version    : 'v' // use graph api version 2.8
    });

    // Now that we've initialized the JavaScript SDK, we call 
    // FB.getLoginStatus().  This function gets the state of the
    // person visiting this page and can return one of three states to
    // the callback you provide.  They can be:
    //
    // 1. Logged into your app ('connected')
    // 2. Logged into Facebook, but not your app ('not_authorized')
    // 3. Not logged into Facebook and can't tell if they are logged into
    //    your app or not.
    //
    // These three cases are handled in the callback function.

    FB.getLoginStatus(function(response) {
      statusChangeCallback(response);
    });

  };

  // Load the SDK asynchronously
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));

  // Here we run a very simple test of the Graph API after login is
  // successful.  See statusChangeCallback() for when this call is made.
  /*function testAPI() {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function(response) {
      console.log('Successful login for: ' + response.name);
      document.getElementById('status').innerHTML =
        'Thanks for logging in, ' + response.name + '!';
    });
  }*/
  function login() {
            FB.login(function(response) {

            // handle the response
            console.log("Response goes here!");

            }, {scope: 'read_stream,publish_stream,publish_actions,read_friendlists'});            
        }

        function logout() {
            FB.logout(function(response) {
              // user is now logged out
            });
        }

        var status = FB.getLoginStatus();

        console.log(status);
